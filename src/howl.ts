import type { Howl } from "howler";
import * as monaco from "monaco-editor";

const editorContainer = document.getElementById("howls") as HTMLElement;
const howlsEditor = monaco.editor.create(editorContainer, {
    language: "javascript",
    automaticLayout: true,
    theme: "vs-dark",
});

const model = howlsEditor.getModel();
if (model) {
    model.setEOL(monaco.editor.EndOfLineSequence.LF);
}

let howls: { [key: string]: Howl } = {};

export function preprocessHowls(dialogue: string, silent = false) {
    let execs = dialogue.match(/EXEC::(.+)$/gm);

    if (!execs) return dialogue; // no exec matches so we have nothing to do

    for (let exec of execs) {
        if (!/play|pause|stop|mute|volume|fade|rate|seek|loop|load|unload|ratween/.test(exec)) continue; // this exec has no code we're interested in.

        let howlObjects: { name: string; command: string; args: string }[] = [];
        let newExec = exec;

        let howlCommands = exec.matchAll(/([\w.-]+)\.(play|pause|stop|mute|volume|fade|rate|seek|loop|load|unload)\((.*?)\)/g);

        for (let howlCommand of howlCommands) {
            let [_, howlName, command, args] = howlCommand;
            if (!howlName || !command) continue; // malformed command

            let howlObject = {
                name: howlName,
                command: command,
                args: args,
            };

            newExec = newExec.replace(howlCommand[0], "");

            let howl = howls[howlName];
            if (!howl) {
                if (!silent)
                    window.chatter({ actor: "funfriend", text: `Dialogue referenced a howl that does not exist! This will be ignored.`, readout: true });
                continue;
            } else {
                howlObjects.push(howlObject);
            }
        }

        let sfxmapCommands = exec.matchAll(/[^.](play|ratween)\((.*?)\)/g);

        if (sfxmapCommands) {
            for (let sfxmapCommand of sfxmapCommands) {
                let [_, command, strArgs] = sfxmapCommand;

                // I do not like this, but i did not feel like refactoring for a single extra command.
                if (command === "ratween") {
                    let howlName = strArgs.split(",")[0].replaceAll("'", "").replaceAll('"', "").replaceAll("`", "");

                    let args = [parseFloat(strArgs.split(",")[1]) || 1.0, parseFloat(strArgs.split(",")[2]) || 1000];

                    let howlObject = {
                        name: howlName,
                        command: "ratween",
                        args: JSON.stringify(args),
                    };

                    let howl = howls[howlName];
                    if (!howl) {
                        if (!silent)
                            window.chatter({
                                actor: "funfriend",
                                text: `Dialogue referenced a howl that does not exist! This will be ignored.`,
                                readout: true,
                            });
                        continue;
                    } else {
                        newExec = newExec.replace(sfxmapCommand[0].slice(1), "");
                        howlObjects.push(howlObject);
                    }

                } else if (command === "play") {
                    let args = [
                        strArgs.split(",")[0].replaceAll("'", "").replaceAll('"', "").replaceAll("`", ""),
                        parseFloat(strArgs.split(",")[1]) || true,
                        parseFloat(strArgs.split(",")[2]) || 0.75,
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

            if (!howlObject.command.match(/^(play|pause|stop|mute|volume|fade|rate|seek|loop|load|unload|ratween)$/)) {
                window.chatter({ actor: "funfriend", text: `Dialogue referenced an invalid howl command! This will be ignored.`, readout: true });
                continue;
            }

            if (howlObject.name === "__SFXMAP") {
                try {
                    let args = JSON.parse(howlObject.args);
                    newHowlCode += `play("${args[0]}", ${args[1] || true}, ${args[2] || 0.75});`;
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

                if (howlObject.command === "ratween") {
                    args = args.slice(1, -1); // remove surrounding brackets again
                    newHowlCode += `ratween(fetchHowl("${howlObject.name}"), ${args});`;
                }
                else {
                    newHowlCode += `fetchHowl("${howlObject.name}").${howlObject.command}(${args});`;
                }
            } catch (e) {
                console.error("Failed to parse howl command arguments:", e);
                window.chatter({
                    actor: "actual_site_error",
                    text: `Howl command contains invalid arguments! It will be invoked without them.`,
                    readout: true,
                });
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
}

export function stopHowls() {
    for (let howlName in howls) {
        if (howls.hasOwnProperty(howlName)) {
            howls[howlName].stop();
        }
    }
}

export function fetchHowl(name: string): Howl {
    if (!howls[name]) {
        throw new Error(`Howl "${name}" does not exist.`);
    }
    return howls[name];
}

Object.defineProperty(window, "fetchHowl", {
    value: fetchHowl,
});

export function getHowlsContent(): string {
    return howlsEditor.getValue();
}

export function setHowlsContent(content: string): void {
    // WE HATE CRLF
    content = content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
    howlsEditor.setValue(content);
    model?.setEOL(monaco.editor.EndOfLineSequence.LF);
}

export function updateHowls() {
    let howlsContent = getHowlsContent().trim();

    let execCheck = document.querySelector("#enable-exec") as HTMLInputElement;

    if (execCheck.checked) {
        try {
            new Function(howlsContent);
        } catch (e) {
            console.error("Failed to evaluate howls content:", e);
            window.chatter({
                actor: "actual_site_error",
                text: "An error occurred while evaluating your howls. Please check the console for details.",
                readout: true,
            });
            return 0;
        }
    }

    let howlMatches = howlsContent.matchAll(/([\w-.]+) = new Howl\(({[^]*?})\);/g);

    stopAllHowls();

    howls = {}; // reset howls

    let howlCount = 0;

    for (let howl of howlMatches) {
        let [_, name, options] = howl;
        if (!name || !options) continue; // malformed howl definition

        // best-effort attempt to turn a js object into a JSON object
        options = options.replaceAll("'", '"');
        options = options.replaceAll(/[ ,]+(\w+)\s*:/g, '"$1":');

        try {
            let howlOptions = JSON.parse(options);
            let newOptions = {
                src: howlOptions.src,
                volume: howlOptions.volume,
                rate: howlOptions.rate,
                loop: howlOptions.loop,
                html5: howlOptions.html5,
                preload: howlOptions.preload,
                mute: howlOptions.mute,
                sprite: howlOptions.sprite,
                pool: howlOptions.pool,
                format: howlOptions.format,
                // no callbacks sorry :(
            };

            howls[name] = new window.Howl(newOptions);

            howlCount++;
        } catch (e) {
            console.error(`Failed to parse howl "${name}":`, e);
            window.chatter({
                actor: "actual_site_error",
                text: `An error occurred while parsing howl "${name}". Most likely a syntax issue, but could be a real bug. Please reach out in the discord for assistance.`,
                readout: true,
            });
            window.chatter({ actor: "actual_site_error", text: "Error details: " + e, readout: true });
        }
    }
    return howlCount;
}

export function stopAllHowls() {
    for (let howlName in howls) {
        if (howls.hasOwnProperty(howlName)) {
            howls[howlName].stop();
        }
        window.sfxmap.stop();
    }
}

setHowlsContent(localStorage.getItem("howls") || "");

updateHowls();

document.querySelector("#save-howls")?.addEventListener("click", () => {
    let howls = getHowlsContent().trim();
    localStorage.setItem("howls", howls);
    let count = updateHowls();
    window.chatter({ actor: "funfriend", text: `${count} Custom howls saved successfully.`, readout: true });
    window.play("talk", 2);
});
