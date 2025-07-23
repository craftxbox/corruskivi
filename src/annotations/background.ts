import type { Changes } from "../processors";

const DEFAULT_BACKGROUND = "#content::before {background: url(https://corru.observer/img/textures/ccontours.gif);}\n";
const DEFAULT_FOREGROUND = "#content::after {background: url(https://corru.observer/img/textures/fadeinlonghalf.gif);background-size: auto 100%;}\n";

type BackgroundChange = {
    applyBackground: string[] | undefined;
};

export function preProcessBackground(changes: Changes): Changes {
    let applyBackground = [];
    let dialogue = changes.dialogue;

    for (const match of dialogue.matchAll(/^@(foreground|background) (https:\/\/.+|none)$/gm)) {
        if (!match) continue; //what?

        let url = match[2];

        dialogue = dialogue.replace(match[0], "");
        if (match[1] === "foreground") {
            applyBackground.push(`#content::after {background: url(${url});}\n`);
        } else if (match[1] === "background") {
            applyBackground.push(`#content::before {background: url(${url});}\n`);
        }
    }

    return {
        dialogue: dialogue,
        changes: { ...changes.changes, applyBackground },
    };
}

export function postProcessBackground(chain: string, changes: { [key: string]: any }): void {
    changes as BackgroundChange;

    let applyBackground = changes.applyBackground;
    let stylesheet: string | undefined;

    if (chain === "editorpreview") {
        stylesheet = DEFAULT_BACKGROUND + DEFAULT_FOREGROUND;
    }

    if (applyBackground && applyBackground.length > 0) {
        stylesheet = applyBackground.join("");
    }

    if (!stylesheet) return;

    if(chain === "editorpreview") {
        let bg = document.querySelector("#bg") as HTMLStyleElement;
        bg.innerHTML = stylesheet;
        return;
    }

    Object.defineProperty(window.env.dialogues[chain], "__exec_start", {
        value: () => {
            let bg = document.querySelector("#bg") as HTMLStyleElement;
            bg.innerHTML = stylesheet
        },
        writable: false,
        configurable: false,
        enumerable: false,
    });
}
