export function preProcessEasyScript(dialogue: string): string {
    if (/^:?(\w+(?:::\w+)?):(.*)/gm.test(dialogue) == false) return dialogue;

    let defaultSpeaker = "sourceless";
    let defaultMatch = dialogue.match(/^defaultSpeaker: ?(.+)/mi);
    if (defaultMatch) {
        defaultSpeaker = defaultMatch[1].trim();
        dialogue = dialogue.replace(/^defaultSpeaker: ?(.+)/mi, "");
    }

    for (let match of dialogue.matchAll(/^:?(\w+(?:::\w+)?)(?!\\):(.*)/gm)) {
        let [_, actor, text] = match;
        if(actor === "endbutton") {
            dialogue = dialogue.replace(match[0], `    RESPONSES::self\n        ${text}<+>END`);
        } else {
            dialogue = dialogue.replace(match[0], `    ${actor}\n        ${text}`);
        }

    }
    dialogue = dialogue.replaceAll(/^(?!    )((?:[\w ]|\\:)+$)/gm, `    ${defaultSpeaker}\n        $1`);

    if (/^start/.test(dialogue) == false) {
        dialogue = `start\n${dialogue}`;
    }
    return dialogue;
}
