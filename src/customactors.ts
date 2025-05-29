import { clone } from "./clone";
import * as monaco from "monaco-editor";
import { generateEditorDialogue } from "./main";
import { insertExtraActors } from "./actors";

const editorContainer = document.getElementById("customactors") as HTMLElement;
const actorsEditor = monaco.editor.create(editorContainer, {
    language: "json",
    automaticLayout: true,
    theme: "vs-dark",
});

export function getCustomActorsContent(): string {
    return actorsEditor.getValue();
}

export function setCustomActorsContent(content: string): void {
    actorsEditor.setValue(content);
}

setCustomActorsContent(localStorage.getItem("actors") || "");

for (let key of Object.keys(window.env.dialogueActors)) {
    let image = window.env.dialogueActors[key].image;
    if (!image) {
        console.warn(`Actor ${key} has no image defined.`);
        continue;
    }
    window.env.dialogueActors[key].image = image.startsWith("https://") ? image : `https://corru.observer${image}`;
}

let originalActors = clone(window.env.dialogueActors);

function parseActors(actors: string) {
    let actorJSON = actors.replaceAll(/\( *\) *=> *play *\( *['"`](.*)['"`] *, *(\d+\.?\d*) *\)/g, (_, sound, volume) => {
            return `["${sound}", ${volume}]`;
    });

    return JSON.parse(actorJSON);
}

export function updateActors() {
    let actorJSON = getCustomActorsContent().trim();

    let actors = actorJSON ? parseActors(actorJSON) : {};

    window.env.dialogueActors = clone(originalActors);
    insertExtraActors();

    for (let actorName of Object.keys(actors)) {
        if (actors.hasOwnProperty(actorName)) {
            let actor = actors[actorName];
            window.env.dialogueActors[actorName] = actor;
            if (window.env.dialogueActors[actorName].voice) {
                let voice = window.env.dialogueActors[actorName].voice as any;
                if (voice?.length == 2) {
                    window.env.dialogueActors[actorName].voice = () => {
                        window.play(voice[0], voice[1]);
                    };
                }
            }
        }
    }
}

document.querySelector("#save-custom-actors")?.addEventListener("click", () => {
    let actors = getCustomActorsContent().trim();
    try {
        parseActors(actors)
    } catch (e) {
        window.chatter({ actor: "funfriend", text: "Invalid JSON format for actors. Please check your input.", readout: true });
        return;
    }
    localStorage.setItem("actors", actors);
    updateActors();
    window.chatter({ actor: "funfriend", text: "Custom actors saved successfully.", readout: true });
    window.play("talk", 2);
    generateEditorDialogue();
});
