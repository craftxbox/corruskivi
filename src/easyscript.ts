import { getEditorContent, setEditorContent } from "./monaco";

const easyscriptRegex = /^(?!    |____|SKIP|END)(?!RESPOBJ):?(\w+(?:::\w+)?)(?!\\):(.*)/gm

const speakerMap: {[key: string]: string} = {
	"interloper":"self",
	"velzie":"unknown",
	"memory hole":"¥Óñ«J",
	"vekoa":"groundsmind",
	"proxy":"sys",
	"mindspike":"sys",
	"geliblueeyes": "geli::blueeyes",
	"geliconcern": "geli::concern",
	"gelihappy": "geli::happy",
	"gelithink": "geli::think",
	"geliuncanny": "geli::uncanny",
	"bsteliblueeyes": "bsteli::blueeyes",
	"bsteliconcern": "bsteli::concern",
	"bstelihappy": "bsteli::happy",
	"bstelithink": "bsteli::think",
	"bsteliuncanny": "bsteli::uncanny",
	"gordon":"envoy"
}

export function preProcessEasyScript(dialogue: string): string {
    if (new RegExp(easyscriptRegex).test(dialogue) == false) return dialogue;

    console.log("Preprocessing easyscript dialogue...");

    let defaultSpeaker = "sourceless";
    let defaultMatch = dialogue.match(/^defaultSpeaker: ?(.+)/mi);
    if (defaultMatch) {
        defaultSpeaker = defaultMatch[1].trim();
        dialogue = dialogue.replace(/^defaultSpeaker: ?(.+)/mi, "");
    }

    for (let match of dialogue.matchAll(new RegExp(easyscriptRegex))) {
        let [_, actor, text] = match;

        if (speakerMap.hasOwnProperty(actor.toLowerCase())) {
            actor = speakerMap[actor.toLowerCase()];
        }

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


document.getElementById("de-easyscript")?.addEventListener("click", deeasyscript);

function deeasyscript() {
    let dialogue = getEditorContent();
    let processedDialogue = preProcessEasyScript(dialogue);
    if (dialogue == processedDialogue) {
        window.chatter({ actor: "funfriend", text: "This dialogue does not seem to be in easyscript format!", readout: true });
        return;
    }

    setEditorContent(processedDialogue);
    window.chatter({ actor: "funfriend", text: "Dialogue converted from easyscript format!", readout: true });
}