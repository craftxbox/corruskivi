export function preprocessNavigation(dialogue: string, silent = false) {
    let execs = dialogue.match(/EXEC::(.+)$/gm);

    if (!execs) return dialogue; // no exec matches so we have nothing to do

    for (let exec of execs) {
        if (!/window\.location\.assign|window\.open|window\.location\.replace|window\.location\.reload|window\.location(\.href)?|window\.close/.test(exec))
            continue; // this exec has no code we're interested in.

        let navObjects: { command: string; args: string }[] = [];
        let newExec = exec;

        let navCommands = exec.matchAll(
            /window\.(?:location\.)?(assign|replace|reload|open)\("(.*?)"\)|window\.(location)(?:\.href)? *= *"(.*?)"|window\.(close)\(\)/g
        );

        for (let navCommand of navCommands) {
            let navObject = {
                command: navCommand[1] || navCommand[3],
                args: navCommand[2] || navCommand[4] || "",
            };

            if (!navObject.command) {
                if (!silent) window.chatter({ actor: "funfriend", text: `Dialogue navigation command is malformed! This will be ignored.`, readout: true });
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
            if (!navObject.command.match(/^(assign|replace|reload|location|close|open)$/)) {
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
                case "open":
                    newNavCode += `navigate("${args}", false, true);`;
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

function navigate(url: string, trusted: boolean = false, blank = false) {
    if ((window as any).creatingPreview) return; // so we dont navigate when trying to share or test

    let urlObj = new URL(url);

    let execCheck = document.querySelector("#enable-exec") as HTMLInputElement;
    if (execCheck && execCheck.checked) {
        // If the exec check is enabled, we allow all navigations
        trusted = true;
    }

    if (trusted == false && urlObj.hostname != window.location.hostname) {
        if (
            (urlObj.hostname.endsWith("corru.observer") ||
                urlObj.hostname.endsWith("corru.works") ||
                urlObj.hostname.endsWith("corru.store") ||
                urlObj.hostname.endsWith("corru.wiki") ||
                urlObj.hostname.endsWith("craftxbox.com") ||
                urlObj.hostname.endsWith("crxb.cc")) == false
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
                                    <span id="gpu-done" class="button" onclick="navigate('${urlObj.href}',true,${blank});document.querySelector('#nav-warning').remove()">i trust the destination</span>
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

    if (blank) window.open(url, "_blank");
    else {
        if (window.location.pathname === urlObj.pathname) {
            window.location.hash = urlObj.hash;
            window.location.reload();
        }
        window.location.assign(url);
    }
}

Object.defineProperty(window, "navigate", {
    value: navigate,
    writable: false,
    configurable: false,
    enumerable: false,
});