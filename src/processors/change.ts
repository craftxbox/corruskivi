export function preprocessChange(dialogue: string): string {
    let execs = dialogue.match(/EXEC::(.+)$/gm);

    if (!execs) return dialogue; // no exec matches so we have nothing to do

    for (let exec of execs) {
        let newExec = exec;

        let match = exec.match(/(changeBranch|changeDialogue)\("(\w+)"\)/);
        if (!match) continue; 

        let [_, command, name] = match;

        let code = `            _CHANGE::${JSON.stringify([name, command])}`;
        newExec = newExec.replace(match[0], "");
        dialogue = dialogue.replace(exec, `${newExec}\n${code}`);
    }
    dialogue = dialogue.replaceAll(/^ +EXEC::[ ;]*$\n/gm, ""); // clean up any empty exec lines
    return dialogue;
}

export function postprocessChange(dialogue: string): string {
    let codes = dialogue.match(/_CHANGE::(.+)$/gm);

    if (!codes) return dialogue;

    for (let code of codes) {
        let match = code.match(/_CHANGE::(.+)$/);
        if (!match) continue;

        let newCode = "";

        let [_, data] = match;
        let [name, command]: [string, string] = JSON.parse(data);

        if (command === "changeBranch") {
            newCode = `changeBranch(${name})`;
        } else if (command === "changeDialogue") {
            newCode = `changeDialogue(${name})`;
        } else {
            window.chatter({ actor: "funfriend", text: `Invalid change command "${command}" found in dialogue. This will be ignored.`, readout: true });
            continue;
        }

        let regex = new RegExp(`EXEC::(.+)\n +${code.replaceAll("[", "\\x5b").replaceAll("]", "\\x5d").replaceAll(".", "\\x2e")}`, "m");

        if (dialogue.match(regex)) {
            let match = dialogue.match(regex);
            if (!match) throw new Error("Failed to match bgm code in dialogue. This condition should be impossible.");
            dialogue = dialogue.replace(match[0], `EXEC::${match[1]};${newCode}`);
        } else {
            dialogue = dialogue.replace(code, `EXEC::${newCode}`);
        }
    }
    return dialogue;
}
