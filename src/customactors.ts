import { clone } from "./clone";
import * as monaco from "monaco-editor";
import { generateEditorDialogue } from "./main";
import { insertExtraActors } from "./actors";
import { fetchHowl } from "./howl";

const editorContainer = document.getElementById("customactors") as HTMLElement;
const actorsEditor = monaco.editor.create(editorContainer, {
    language: "json",
    automaticLayout: true,
    theme: "vs-dark",
});

const model = actorsEditor.getModel();
if (model) {
    model.setEOL(monaco.editor.EndOfLineSequence.LF);
}

export function getCustomActorsContent(): string {
    return actorsEditor.getValue();
}

export function setCustomActorsContent(content: string): void {
    content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
    actorsEditor.setValue(content);
    model?.setEOL(monaco.editor.EndOfLineSequence.LF);
}

setCustomActorsContent(localStorage.getItem("actors") || "");

for (let key of Object.keys(window.env.dialogueActors)) {
    let image = window.env.dialogueActors[key].image;
    if (!image) {
        continue;
    }
    window.env.dialogueActors[key].image = image.startsWith("https://") ? image : `https://corru.observer${image}`;
}

let originalActors = clone(window.env.dialogueActors);

function parseActors(actors: string) {
    if (!actors || actors.trim() === "") return {};

    let actorJSON = actors.replaceAll(/\( *\) *=> *(?:window\.)?play *\( *['"`](.*)['"`] *(?:, *(\d+\.?\d*|true))? *\)/g, (_, sound, rate) => {
        return `["${sound}", ${rate || true}]`;
    });

    if (actors.includes("env.dialogueActors")) {
        actorJSON = "{\n" + actorJSON + "\n}";
        // best-effort attempt to turn a js object into a JSON object
        actorJSON = actorJSON.replaceAll(/env.dialogueActors\[['"`](.*?)['"`]\] *= */g, ',"$1": ');
        actorJSON = actorJSON.replaceAll("'", '"');
        actorJSON = actorJSON.replaceAll(/[ ,]+(\w+)\s*:/g, '"$1":');
        actorJSON = actorJSON.replaceAll(/{\s*,/g, "{");
        actorJSON = actorJSON.replaceAll(/,\s*}/g, "}");
        actorJSON = actorJSON.replaceAll(/;*$/gm, "");
    }

    console.log(actorJSON.match(/\(\) => {([\w\.]+).rate\((\d+\.?\d*)\);[\w\.]+.play\((".+")?\)}/g));

    actorJSON = actorJSON.replaceAll(/\(\) => {([\w\.]+).rate\((\d+\.?\d*)\);[\w\.]+.play\((".+")?\)}/g, (_, name, rate, sound) => {
        return `["${name}", "${sound || "__default"}", ${rate || "1"}]`;
    });

    return JSON.parse(actorJSON);
}

export function updateActors() {
    let actorJSON = getCustomActorsContent().trim();

    // best effort attempt to turn js objects into json parseable strings
    actorJSON = actorJSON.replaceAll(/[ ,]+(\w+):/g, '"$1":');

    let actors: { [actor: string]: object } = {};
    try {
        actors = parseActors(actorJSON);
    } catch (e) {
        console.error("Failed to parse actors content:", e);
        window.chatter({ actor: "funfriend", text: "An error occurred while parsing your actors. Please check the console for details.", readout: true });
        return;
    }

    window.env.dialogueActors = clone(originalActors);
    insertExtraActors();

    for (let actorName of Object.keys(actors)) {
        if (actors.hasOwnProperty(actorName)) {
            let actor = actors[actorName] as Actor;
            if (actor.voice && Array.isArray(actor.voice)) {
                actor.voice = voiceify(actor.voice);
            }
            if (actor.expressions) {
                for (let key in actor.expressions) {
                    let expression = actor.expressions[key];

                    if (expression.voice && Array.isArray(expression.voice)) {
                        actor.expressions[key].voice = voiceify(expression.voice);
                    }
                }
            }

            window.env.dialogueActors[actorName] = actor;
        }
    }
}

function voiceify(voice: any[]): () => void {
    if (voice?.length == 2) {
        return () => {
            window.play(voice[0], voice[1]);
        };
    } else if (voice?.length == 3) {
        return () => {
            let howl = fetchHowl(voice[0]);
            if (!howl) {
                console.error(`Howl "${voice[0]}" does not exist.`);
                return;
            }
            howl.rate(voice[2]);
            howl.play(voice[1].length > 0 ? voice[1] : undefined);
        };
    } else return () => {};
}

document.querySelector("#save-custom-actors")?.addEventListener("click", () => {
    let actors = getCustomActorsContent().trim();
    try {
        parseActors(actors);
    } catch (e) {
        window.chatter({ actor: "funfriend", text: "Invalid JSON format for actors. Please check your input.", readout: true });
        console.log("Failed to parse actors content:", e);
        return;
    }
    localStorage.setItem("actors", actors);
    updateActors();
    window.chatter({ actor: "funfriend", text: "Custom actors saved successfully.", readout: true });
    window.play("talk", 2);
    generateEditorDialogue();
});
