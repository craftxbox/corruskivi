export function preprocessNavigation(dialogue: string) {
    let execs = dialogue.match(/EXEC::(.+)$/gm);

    if (!execs) return dialogue; // no exec matches so we have nothing to do

    for (let exec of execs) {
        if (!/window\.location\.assign|window\.location\.replace|window\.location\.reload|window\.location(\.href)?|window\.close/.test(exec)) continue; // this exec has no code we're interested in.

        let navObjects: { command: string; args: string }[] = [];
        let newExec = exec;

        let navCommands = exec.matchAll(/window\.location\.(assign|replace|reload)\("(.*?)"\)|window\.(location)(?:\.href)? *= *"(.*?)"|window\.(close)\(\)/g);

        for (let navCommand of navCommands) {

            let navObject = {
                command: navCommand[1] || navCommand[3] ,
                args: navCommand[2] || navCommand[4] || "",
            };

            if (!navObject.command) {
                window.chatter({ actor: "funfriend", text: `Dialogue navigation command is malformed! This will be ignored.`, readout: true });
                continue;
            }

            newExec = newExec.replace(navCommand[0], "");

            navObjects.push(navObject);
        }

        if (navObjects.length === 0) continue; // no commands found in this exec

        let navCode = "            _NAV::" + JSON.stringify(navObjects) + "\n";
        dialogue = dialogue.replace(exec, newExec + "\n" + navCode);
    }

    dialogue = dialogue.replace(/^ +EXEC::[ ;]*$\n/gm, ""); // clean up any empty exec lines

    return dialogue;
}

export function postprocessNavigation(dialogue: string) {
    let navCodes = dialogue.match(/_NAV::(.+)$/gm);

    if (!navCodes) return dialogue; // no howl codes found

    for (let navCode of navCodes) {
        let navObjects: { command: string; args: string }[] = JSON.parse(navCode.replace("_NAV::", ""));

        let newNavCode = "";

        for (let navObject of navObjects) {
            if (!navObject.command.match(/^(assign|replace|reload|location|close)$/)) {
                window.chatter({ actor: "funfriend", text: `Dialogue referenced an invalid navigation command! This will be ignored.`, readout: true });
                continue;
            }

            let args = JSON.parse(`"${navObject.args}"` || '""');

            if (typeof args !== "string") {
                window.chatter({
                    actor: "funfriend",
                    text: `Dialogue navigation command requires a string argument! It will be invoked without it.`,
                    readout: true,
                });
                args = "";
            }

            switch (navObject.command) {
                case "assign":
                case "replace":
                case "location":
                    newNavCode += `navigate("${args}");`;
                    break;
                case "reload":
                    newNavCode += `window.location.reload();`;
                    break;
                case "close":
                    newNavCode += `window.close();`;
                    break;
                default:
                    window.chatter({ actor: "funfriend", text: `Dialogue navigation command is not recognized! This will be ignored.`, readout: true });
                    continue;
            }
        }

        let regex = new RegExp(`EXEC::(.+)\n +${navCode.replaceAll("[", "\\x5b").replaceAll("]", "\\x5d").replaceAll(".", "\\x2e")}`, "m");

        if (dialogue.match(regex)) {
            let match = dialogue.match(regex);
            if (!match) throw new Error("Failed to match nav code in dialogue. This condition should be impossible.");
            dialogue = dialogue.replace(match[0], `EXEC::${match[1]};${newNavCode}`);
        } else {
            dialogue = dialogue.replace(navCode, `EXEC::${newNavCode}`);
        }
    }

    return dialogue;
}

function navigate(url: string, trusted: boolean = false) {
    let urlObj = new URL(url);
    
    let execCheck = document.querySelector("#enable-exec") as HTMLInputElement;
    if (execCheck && execCheck.checked) {
        // If the exec check is enabled, we allow all navigations
        trusted = true;
    }

    if (trusted == false && urlObj.hostname != window.location.hostname) {
        if (
            (
                urlObj.hostname.endsWith("corru.observer") ||
                urlObj.hostname.endsWith("corru.works") ||
                urlObj.hostname.endsWith("corru.store") ||
                urlObj.hostname.endsWith("corru.wiki") ||
                urlObj.hostname.endsWith("craftxbox.com") ||
                urlObj.hostname.endsWith("crxb.cc") ||
            ) == false
        ) {
            document.body.insertAdjacentHTML(
                "beforeend",
                `
                    <div id="nav-warning" class="popup-warning">
                        <div class="sysblock">
                            <div class="sysbox">
                                <h3>!!__WARNING__!!</h3>
                                <p class="sysinfo">Memory stream attempts to redirect Mindspike attention to an untrusted dataspace.</p>
                                <p class="sysinfo">Attention will be redirected to: <a href="${url}">${url}</a></p>
                                <p class="sysinfo">Dataspaces may carry dangerous, often lethal thoughtforms. Failure to exercise caution could lead to stroke, chronos misalignment, or worse.</p>
                                <p class="sysinfo">By navigating to this dataspace you waive all right to medical claims against MINDSCI. For more information, please refer to your license agreement.</p>
                                <div class="buttons">
                                    <span id="gpu-done" class="button" onclick="navigate('${urlObj.href}',true)">i trust the destination</span>
                                    <span id="gpu-hide" class="button" onclick="document.querySelector('#nav-warning').remove()">i do not trust the destination</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            );
            return;
        }
    }

    window.location.assign(url);
}

Object.defineProperty(window, "navigate", {
    value: navigate,
    writable: false,
    configurable: false,
    enumerable: false,
});

/*
export function preprocessHowls(dialogue: string) {
    let execs = dialogue.match(/EXEC::(.+)$/gm);

    if (!execs) return dialogue; // no exec matches so we have nothing to do

    for (let exec of execs) {
        if (!/play|pause|stop|mute|volume|fade|rate|seek|loop|load|unload/.test(exec)) continue; // this exec has no code we're interested in.

        let howlObjects: { name: string; command: string; args: string }[] = [];
        let newExec = exec;

        let navCommands = exec.matchAll(/([\w-]+)\.(play|pause|stop|mute|volume|fade|rate|seek|loop|load|unload)\((.*?)\)/g);

        for (let navCommand of navCommands) {
            let [_, howlName, command, args] = navCommand;
            if (!howlName || !command) continue; // malformed command

            let howlObject = {
                name: howlName,
                command: command,
                args: args,
            };

            newExec = newExec.replace(navCommand[0], "");

            let howl = howls[howlName];
            if (!howl) {
                window.chatter({ actor: "funfriend", text: `Dialogue referenced a howl that does not exist! This will be ignored.`, readout: true });
                continue;
            } else {
                howlObjects.push(howlObject);
            }
        }

        let sfxmapCommands = exec.matchAll(/[^.]play\((.*)\)/g);

        if (sfxmapCommands) {
            for (let sfxmapCommand of sfxmapCommands) {
                let [_, strArgs] = sfxmapCommand;

                let args = [
                    strArgs.split(",")[0].replaceAll("'", "").replaceAll('"', "").replaceAll("`", ""),
                    parseFloat(strArgs.split(",")[1]) || 1,
                    parseFloat(strArgs.split(",")[2]) || 1,
                ];

                let howlObject = {
                    name: "__SFXMAP",
                    command: "play",
                    args: JSON.stringify(args),
                };
                newExec = newExec.replace(sfxmapCommand[0].slice(1), "");
                howlObjects.push(howlObject);
            }
        }
        if (howlObjects.length === 0) continue; // no howl commands found in this exec

        let howlCode = "            _HOWL::" + JSON.stringify(howlObjects) + "\n";
        dialogue = dialogue.replace(exec, newExec + "\n" + howlCode);
    }

    dialogue = dialogue.replace(/^ +EXEC::[ ;]*$\n/gm, ""); // clean up any empty exec lines

    return dialogue;
}

export function postprocessHowls(dialogue: string) {
    let howlCodes = dialogue.match(/_HOWL::(.+)$/gm);

    if (!howlCodes) return dialogue; // no howl codes found

    for (let howlCode of howlCodes) {
        let howlObjects: { name: string; command: string; args: string }[] = JSON.parse(howlCode.replace("_HOWL::", ""));

        let newHowlCode = "";

        for (let howlObject of howlObjects) {
            let howl = howls[howlObject.name];
            if (howlObject.name !== "__SFXMAP" && !howl) {
                window.chatter({ actor: "funfriend", text: `Dialogue referenced a howl that does not exist! This will be ignored.`, readout: true });
                continue;
            }

            if (!howlObject.command.match(/^(play|pause|stop|mute|volume|fade|rate|seek|loop|load|unload)$/)) {
                window.chatter({ actor: "funfriend", text: `Dialogue referenced an invalid howl command! This will be ignored.`, readout: true });
                continue;
            }

            if (howlObject.name === "__SFXMAP") {
                try {
                    let args = JSON.parse(howlObject.args);
                    newHowlCode += `play("${args[0]}", ${args[1] || 1}, ${args[2] || 1});`;
                } catch (e) {
                    console.error("Failed to parse play command arguments:", e);
                    window.chatter({ actor: "actual_site_error", text: `Dialogue contains an invalid play command! It will be ignored.`, readout: true });
                    continue;
                }
                continue;
            }
            try {
                let args = JSON.parse(`[${howlObject.args}]` || "[]");
                args = JSON.stringify(args).slice(1, -1); // remove the surrounding brackets

                newHowlCode += `fetchHowl("${howlObject.name}").${howlObject.command}(${args});`;
            } catch (e) {
                console.error("Failed to parse howl command arguments:", e);
                window.chatter({ actor: "actual_site_error", text: `Howl command contains invalid arguments! It will be invoked without them.`, readout: true });
                newHowlCode += `fetchHowl("${howlObject.name}").${howlObject.command}();`;
                continue;
            }
        }

        let regex = new RegExp(`EXEC::(.+)\n +${howlCode.replaceAll("[", "\\x5b").replaceAll("]", "\\x5d").replaceAll(".", "\\x2e")}`, "m");

        if (dialogue.match(regex)) {
            let match = dialogue.match(regex);
            if (!match) throw new Error("Failed to match howl code in dialogue. This condition should be impossible.");
            dialogue = dialogue.replace(match[0], `EXEC::${match[1]};${newHowlCode}`);
        } else {
            dialogue = dialogue.replace(howlCode, `EXEC::${newHowlCode}`);
        }
    }

    return dialogue;
}*/
