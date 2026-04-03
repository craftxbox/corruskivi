export type BgmOptions = {
    length?: number;
    preserve?: boolean;
    rate?: number | false;
    seek?: number | false;
    pause?: boolean;
};

export function preprocessBgm(dialogue: string): string {
    let execs = dialogue.match(/EXEC::(.+)$/gm);

    if (!execs) return dialogue; // no exec matches so we have nothing to do

    for (let exec of execs) {
        let newExec = exec;

        let match = exec.match(/(changeBgm|revertBgm|toggleBgm)\(([\w.-]+) ?,? ?([^;]*)?\)/);
        if (!match) continue; // not a bgm exec, skip

        let [_, command, name, options] = match;
        let optionsObj: BgmOptions = {} as any;
        if (options) {
            try {
                options = options.replaceAll(/[ ,]+(\w+):/g, '"$1":');
                let obj = JSON.parse(options);
                if (typeof obj === "boolean") optionsObj.preserve = obj;
                else {
                    if (typeof obj.length === "number") optionsObj.length = obj.length;
                    if (typeof obj.preserve === "boolean") optionsObj.preserve = obj.preserve;
                    if (obj.rate === false || typeof obj.rate === "number") optionsObj.rate = obj.rate;
                    if (obj.seek === false || typeof obj.seek === "number") optionsObj.seek = obj.seek;
                    if (typeof obj.pause === "boolean") optionsObj.pause = obj.pause;
                }
            } catch (e) {
                window.chatter({ actor: "funfriend", text: `Failed to parse options for ${command}(${name}). Please check your syntax.`, readout: true });
                console.error(`Failed to parse options for ${command}(${name}):`, e);
                continue;
            }
        }

        let bgmcode = `            _BGM::${JSON.stringify([name, command, optionsObj])}`;
        newExec = newExec.replace(match[0], "");
        dialogue = dialogue.replace(exec, `${newExec}\n${bgmcode}`);
    }
    dialogue = dialogue.replaceAll(/^ +EXEC::[ ;]*$\n/gm, ""); // clean up any empty exec lines
    return dialogue;
}

export function postprocessBgm(dialogue: string): string {
    let bgmcodes = dialogue.match(/_BGM::(.+)$/gm);

    if (!bgmcodes) return dialogue;

    for (let bgmcode of bgmcodes) {
        let match = bgmcode.match(/_BGM::(.+)$/);
        if (!match) continue;

        let newBgmCode = "";

        let [_, data] = match;
        let [name, command, options]: [string, string, BgmOptions] = JSON.parse(data);

        if (command === "changeBgm") {
            newBgmCode = `changeBgm(fetchHowl("${name}")${Object.keys(options).length > 0 ? `, ${JSON.stringify(options)}` : ""})`;
        } else if (command === "revertBgm") {
            newBgmCode = `revertBgm(${parseInt(name) > 0 ? name : ""})`;
        } else if (command === "toggleBgm") {
            newBgmCode = `toggleBgm(${name}, ${options && options.preserve === true ? "true" : "false"})`;
        } else {
            window.chatter({ actor: "funfriend", text: `Invalid BGM command "${command}" found in dialogue. This will be ignored.`, readout: true });
            continue;
        }

        let regex = new RegExp(`EXEC::(.+)\n +${bgmcode.replaceAll("[", "\\x5b").replaceAll("]", "\\x5d").replaceAll(".", "\\x2e")}`, "m");

        if (dialogue.match(regex)) {
            let match = dialogue.match(regex);
            if (!match) throw new Error("Failed to match bgm code in dialogue. This condition should be impossible.");
            dialogue = dialogue.replace(match[0], `EXEC::${match[1]};${newBgmCode}`);
        } else {
            dialogue = dialogue.replace(bgmcode, `EXEC::${newBgmCode}`);
        }
    }
    return dialogue;
}

let oldChangeBgm = window.changeBgm;
let oldRevertBgm = window.revertBgm;
let oldToggleBgm = window.toggleBgm;
window.changeBgm = function (howl: Howl, options: BgmOptions = { length: 1000 }) {
    if (!window.env.oldBgm) window.env.oldBgm = window.sfxmap;
    if (!window.env.bgm) window.env.bgm = window.sfxmap;
    oldChangeBgm(howl, options);
}

window.revertBgm = function (length = 1000) {
    if (!window.env.oldBgm) window.env.oldBgm = window.sfxmap;
    if (!window.env.bgm) window.env.bgm = window.sfxmap;
    oldRevertBgm(length);
}

window.toggleBgm = function (howl: Howl, preserve = false) {
    if (!window.env.oldBgm) window.env.oldBgm = window.sfxmap;
    if (!window.env.bgm) window.env.bgm = window.sfxmap;
    oldToggleBgm(howl, preserve);
}
