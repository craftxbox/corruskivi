import type LZString from "lz-string";
import type { Howl } from "howler";
import { previewDialogue } from "./previewDialogue";

import "./actors";
import "./silly/vapor";
import { playStartupDialogue } from "./startup";
import { getEditorContent, setEditorContent } from "./monaco";

import "./types.d";
import "./saves";
import { getCustomActorsContent, setCustomActorsContent, updateActors } from "./customactors";
import { getDefinesContent, setDefinesContent, updateDefines } from "./defines";
import { getHowlsContent, setHowlsContent, stopHowls, updateHowls } from "./howl";
import { decodeShareString, makeShareString, uploadShareString, type ShareObject } from "./share";
import { postProcessDialogue, processChains, preProcessDialogue, preProcessChain, postProcessChain } from "./processors";
import { clearTestPath, getTestPath } from "./annotations/testpath";

declare global {
    interface Window {
        startDialogue: (dialogue: string, settings?: { originEntityId?: string; specificChain?: string }) => void;
        endDialogue: (callback?: Function) => void;
        sendDialogue: (branch: DialogueBranch, index: number) => void;
        generateDialogueObject: (dialogue: string) => Dialogue;
        changeBranch: (branch: string) => void;
        changeDialogue: (dialogue: string) => void;
        undoallchanges?: () => void;
        changeBgm: (howl: Howl) => void;
        chatter: (obj: {
            actor: string;
            text: string;
            duration?: number;
            sfx?: boolean;
            delay?: number;
            log?: boolean;
            readout?: boolean;
            customEl?: any;
        }) => void;
        page: {
            formedDefinitionStrings?: { [key: string]: Object | string };
        };
        check(key: string, state: string): boolean;
        play: (sfx: string, pitch?: number) => void;
        LZString: typeof LZString;
        Howl: typeof Howl;
        originalActors: { [key: string]: Actor };
        sfxmap: {
            _src: string;
            load: () => void;
        };
        env: {
            abyss: {
                drowningFear: Function;
            };
            dialogues: {
                [key: string]: Dialogue;
            };
            dialogueActors: {
                [key: string]: Actor;
            };
            definitions: {
                [key: string]: string | { type: string; text: string };
            };
            currentDialogue: {
                active: boolean;
                canStart: boolean;
                originEntityId?: string | null;
                actors: {
                    [key: string]: Actor;
                };
                prevSpeaker: string | false;
                chainName: string;
                justChanged: boolean;
                chain: Dialogue;
                branch: DialogueBranch;
            };
            dialogueWaitTimeout?: number;
        };
    }
}

window.sfxmap._src = "https://corru.observer" + window.sfxmap._src;
window.sfxmap.load();

const dialogueBox = document.querySelector("#dialogue-box") as HTMLDivElement;

export function startNewDialogue(dialogue: string, settings?: { originEntityId?: string; specificChain?: string }): boolean {
    const sanityDialogue = window.env.dialogues[dialogue];
    if (!sanityDialogue) {
        window.chatter({ actor: "funfriend", text: `Dialogue with ID ${dialogue} not found.`, readout: true });
        window.play("talk", 2);
        console.error(`Dialogue with ID ${dialogue} not found.`);
        return false;
    }
    const sanityChain = sanityDialogue[settings?.specificChain || "start"];
    if (!sanityChain) {
        window.chatter({ actor: "funfriend", text: `Dialogue chain ${settings?.specificChain || "start"} not found in dialogue ${dialogue}.`, readout: true });
        window.play("talk", 2);
        console.error(`Dialogue chain ${settings?.specificChain || "start"} not found in dialogue ${dialogue}.`);
        return false;
    }

    if (window.env.currentDialogue && window.env.currentDialogue.active) {
        let body = document.body;
        body.removeAttribute("currentDialogue");
        body.classList.remove("in-dialogue", "in-menu");
        dialogueBox.innerHTML = "";

        window.env.currentDialogue.active = false;
        window.env.currentDialogue.prevSpeaker = false;

        window.env.currentDialogue.canStart = true;

        if (window.env.dialogueWaitTimeout) {
            clearTimeout(window.env.dialogueWaitTimeout);
            delete window.env.dialogueWaitTimeout;
        }
        window.startDialogue(dialogue, settings);
    } else window.startDialogue(dialogue, settings);
    return true;
}

Object.defineProperty(window, "_startNewDialogue", {
    value: startNewDialogue,
});

export function previewEntireDialogue(dialogueID: string, settings?: { originEntityId?: string; specificChain?: string }) {
    let dialogue = window.env.dialogues[dialogueID];
    if (!dialogue) {
        window.chatter({ actor: "funfriend", text: `Dialogue with ID ${dialogueID} not found.`, readout: true });
        window.play("talk", 2);
        console.error(`Dialogue with ID ${dialogueID} not found.`);
        return;
    }

    Object.defineProperty(window, "creatingPreview", {
        value: true,
        configurable: true,
        writable: true,
    });

    let branch = dialogue[settings?.specificChain || "start"];
    if (!branch) {
        window.chatter({
            actor: "funfriend",
            text: `Dialogue chain ${settings?.specificChain || "start"} not found in dialogue ${dialogueID}.`,
            readout: true,
        });
        window.play("talk", 2);
        console.error(`Dialogue chain ${settings?.specificChain || "start"} not found in dialogue ${dialogueID}.`);
        return;
    }

    if (!startNewDialogue(dialogueID, settings)) return;
    document.querySelector(".dialogue-message:last-of-type")?.classList.add("sent");

    let localTestPath = getTestPath().map((p) => [...p]);
    clearTestPath();

    if (branch.body && branch.body.length > 0) {
        for (let i = 1; i <= branch.body.length; i++) {
            previewDialogue(branch, i);
        }
    }

    advanceTestPath(localTestPath);

    document.body.removeAttribute("currentDialogue");

    if (window.env.dialogueWaitTimeout) {
        clearTimeout(window.env.dialogueWaitTimeout);
        delete window.env.dialogueWaitTimeout;
    }
    dialogueBox.classList.remove("dialogue-click-proceed");

    let bg = document.getElementById("bg") as HTMLStyleElement;
    bg.innerHTML = "";
    Object.defineProperty(window, "creatingPreview", {
        value: false,
        configurable: true,
        writable: true,
    });
}

function advanceTestPath(testpath: number[][]) {
    let testpoint = testpath.shift();
    document.querySelectorAll(".dialogue-message")?.forEach((el) => el.classList.add("sent"));
    document.querySelectorAll(".dialogue-menu .dialogue-actor")?.forEach((el) => el.classList.add("sent"));
    let [testPathIndex, testPathResponse] = testpoint || [null, null];
    if (testPathIndex === null || testPathResponse === null) {
        document.body.removeAttribute("currentDialogue");

        if (window.env.dialogueWaitTimeout) {
            clearTimeout(window.env.dialogueWaitTimeout);
            delete window.env.dialogueWaitTimeout;
        }
        dialogueBox.classList.remove("dialogue-click-proceed");
        return;
    }

    let dialoguemenu = document.querySelector("#dialogue-menu") as HTMLDivElement;

    let response = dialoguemenu.children[testPathIndex] as HTMLDivElement;
    let reply = response.querySelector(".dialogue-options")?.children[testPathResponse] as HTMLDivElement;

    if (!reply) {
        window.chatter({ actor: "funfriend", text: `Invalid test path response at index ${testPathIndex}, reply ${testPathResponse}.`, readout: true });
        window.play("talk", 2);
        return;
    }

    setTimeout(() => {
        reply.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
        let branch = window.env.currentDialogue.branch;
        if (branch.body && branch.body.length > 0) {
            for (let i = 1; i <= branch.body.length; i++) {
                previewDialogue(branch, i);
            }
        }
        advanceTestPath(testpath);
    }, 25);
}

let changeDialogue = window.changeDialogue;

window.changeDialogue = (dialogue: string) => {
    if (window.env.dialogues[dialogue].hasOwnProperty("__exec_start")) {
        let execStart = window.env.dialogues[dialogue].__exec_start;
        if (typeof execStart === "function") execStart();
    }
    changeDialogue(dialogue);
};

export function generateEditorDialogue() {
    try {
        if (window.undoallchanges) {
            window.undoallchanges();
            delete window.undoallchanges;
        }

        let dialogue = getEditorContent();

        if (dialogue.trim() === "") {
            window.chatter({ actor: "funfriend", text: "The editor is empty. Please write some dialogue before previewing.", readout: true });
            return;
        }

        let execCheck = document.querySelector("#enable-exec") as HTMLInputElement;

        if (execCheck.checked) {
            dialogue = preProcessDialogue(dialogue, false);
            dialogue = postProcessDialogue(dialogue, false);
        } else {
            dialogue = preProcessDialogue(dialogue);

            if (/EXEC::|THEN::|UNREADCHECK::|[ _]END::|SKIP::/.test(dialogue)) {
                window.chatter({
                    actor: "funfriend",
                    text: "Dialogue tried to use forbidden commands to execute code! Refusing to generate this.",
                    readout: true,
                });
                window.env.dialogues["editorpreview"] = window.generateDialogueObject(`start
    sys
        ERROR::'the dialogue editor detected forbidden commands that could execute code'
        ADVISE::'remove EXEC::, THEN::, UNREADCHECK::, END::, or SKIP:: commands from your dialogue'`);
                return;
            }
            dialogue = postProcessDialogue(dialogue);
        }

        let chains = processChains(dialogue, execCheck.checked === false);

        for (const key of chains.chainOrder) {
            let { dialogue, changes } = preProcessChain(chains.chains[key]);
            window.env.dialogues[key] = window.generateDialogueObject(dialogue);
            postProcessChain(key, changes);
        }
    } catch (e) {
        window.chatter({
            actor: "actual_site_error",
            text: "An error occurred while generating the dialogue. Most likely a syntax issue, but could be a real bug. Please reach out in the discord for assistance.",
            readout: true,
        });
        window.chatter({ actor: "actual_site_error", text: "Error details: " + e, readout: true });
        console.error("Error generating dialogue:", e);
    }
}

document.querySelector("#test-dialogue")?.addEventListener("click", () => {
    localStorage.setItem("dialogue", getEditorContent());
    stopHowls();

    generateEditorDialogue();

    previewEntireDialogue("editorpreview");
    window.play("muiScanner", 2);
});

document.querySelector("#preview-dialogue")?.addEventListener("click", () => {
    localStorage.setItem("dialogue", getEditorContent());
    stopHowls();
    generateEditorDialogue();

    startNewDialogue("editorpreview");
    window.play("muiScanner", 2);
});

document.querySelector("#start-dialogue")?.addEventListener("click", () => {
    localStorage.setItem("dialogue", getEditorContent());
    stopHowls();
    generateEditorDialogue();

    enterDirectPreview();
    window.play("muiScanner", 2);
});

document.querySelector("#share-editor-dialogue")?.addEventListener("click", () => {
    localStorage.setItem("dialogue", getEditorContent());
    generateEditorDialogue();
    previewEntireDialogue("editorpreview");
    window.play("talk", 2);

    share();
});

document.querySelector("#share-dialogue")?.addEventListener("click", () => {
    let dialogue = getEditorContent();
    dialogue = preProcessDialogue(dialogue);

    if (/EXEC::|THEN::|UNREADCHECK::|[ _]END::|SKIP::/.test(dialogue)) {
        window.chatter({
            actor: "funfriend",
            text: "You cannot share a memory that uses EXEC commands!",
            readout: true,
        });
        return;
    }

    localStorage.setItem("dialogue", dialogue);
    generateEditorDialogue();
    previewEntireDialogue("editorpreview");
    window.play("talk", 2);

    share("preview");
});

function share(location: string = "") {
    let shareString = makeShareString(getEditorContent(), getCustomActorsContent(), getDefinesContent(), getHowlsContent());
    let shareUrl = uploadShareString(shareString);

    let url = window.location.href.replace(window.location.hash, "") + location + "#" + shareUrl;
    navigator.clipboard
        .writeText(url)
        .then(() => {
            window.chatter({ actor: "funfriend", text: "Dialogue URL copied to clipboard!", readout: true, sfx: false });
        })
        .catch((err) => {
            console.error("Failed to copy URL: ", err);
            window.chatter({ actor: "funfriend", text: "Failed to copy dialogue URL.", readout: true });
        });
}

document.querySelector("#end-dialogue")?.addEventListener("click", () => {
    let bg = document.getElementById("bg") as HTMLStyleElement;
    bg.innerHTML = "";
    if (window.env.currentDialogue && window.env.currentDialogue.active) {
        window.endDialogue();
    }
});

function loadShareObject(data: ShareObject) {
    setEditorContent(data.dialogue); // if THIS one is missing you've made a big mistake
    setCustomActorsContent(data?.actors || "");
    setDefinesContent(data?.defines || "");
    setHowlsContent(data?.howls || "");

    updateActors();
    updateDefines();
    updateHowls();

    generateEditorDialogue();
}

function exportDialogue() {
    let shareString = makeShareString(getEditorContent(), getCustomActorsContent(), getDefinesContent(), getHowlsContent());
    let decoded = window.LZString.decompressFromBase64(shareString);

    navigator.clipboard
        .writeText(decoded || "")
        .then(() => {
            window.chatter({ actor: "funfriend", text: "Dialogue JSON copied to clipboard!", readout: true, sfx: false });
        })
        .catch((err) => {
            console.error("Failed to copy JSON: ", err);
            window.chatter({ actor: "funfriend", text: "Failed to copy dialogue JSON.", readout: true });
        });
}

document.getElementById("export-dialogue")?.addEventListener("click", exportDialogue);

async function importDialogue() {
    navigator.clipboard
        .readText()
        .then(async (text) => {
            try {
                let data = await decodeShareString(text);
                if (data) {
                    loadShareObject(data);
                } else {
                    window.chatter({ actor: "funfriend", text: "No valid dialogue JSON found in clipboard.", readout: true });
                }
            } catch (e) {
                window.chatter({ actor: "funfriend", text: "Failed to import dialogue from clipboard.", readout: true });
                console.error("Failed to import dialogue from clipboard: ", e);
            }
        })
        .catch(async (err) => {
            console.error("Failed to read clipboard: ", err);
            let input = prompt("Paste your dialogue JSON here:");
            if (!input) return;
            try {
                let data = await decodeShareString(input);
                if (data) {
                    loadShareObject(data);
                } else {
                    window.chatter({ actor: "funfriend", text: "No valid dialogue JSON found in input.", readout: true });
                }
            } catch (e) {
                window.chatter({ actor: "funfriend", text: "Failed to import dialogue from input.", readout: true });
                console.error("Failed to import dialogue from input: ", e);
            }
        });
}

document.getElementById("import-dialogue")?.addEventListener("click", importDialogue);

// TODO "export corru script" button
// consider wether the export should be modder focused or 'easymode' for slapping straight into game
// or consider making two options

Object.defineProperty(window, "unpreview", {
    value: () => {
        Object.defineProperty(window.env, "directFromUrl", {
            value: false,
            configurable: true,
            writable: true,
        });
        let bg = document.getElementById("bg") as HTMLStyleElement;
        bg.innerHTML = "";
        document.body.classList.remove("codezone");
        document.querySelector("#system-menu")?.classList.remove("hidden");
        window.history.pushState({}, "", window.location.href.replace("/preview", "/"));
        setTimeout(playStartupDialogue, 50);
    },
});

window.env.dialogues["realpreview"] = window.generateDialogueObject(`start
    sys
        NOTICE::'memory stream located'
            WAIT::10000`);

export function enterDirectPreview() {
    Object.defineProperty(window.env, "directFromUrl", {
        value: true,
        configurable: true,
        writable: true,
    });
    document.body.classList.add("codezone");
    document.querySelector("#system-menu")?.classList.add("hidden");
    startNewDialogue("realpreview");
    setTimeout(() => {
        if (window.env.dialogueWaitTimeout) {
            clearTimeout(window.env.dialogueWaitTimeout);
            delete window.env.dialogueWaitTimeout;
        }
        dialogueBox.classList.add("dialogue-click-proceed");
        dialogueBox.addEventListener(
            "click",
            () => {
                window.changeDialogue("editorpreview");
            },
            { once: true }
        );
        document.addEventListener(
            "keydown",
            (e) => {
                let key = e.key || false;
                if (key && key.toLowerCase() === "enter") {
                    window.changeDialogue("editorpreview");
                }
            },
            { once: true }
        );
    }, 50);
}

Object.defineProperty(window, "enterDirectPreview", {
    value: enterDirectPreview,
});

try {
    decodeShareString(window.location.hash.slice(1))
        .then((data) => {
            if (data) {
                let direct = window.location.pathname.endsWith("preview");
                loadShareObject(data);

                if (direct) {
                    enterDirectPreview();
                } else {
                    Object.defineProperty(window.env, "directFromUrl", {
                        value: false,
                        configurable: true,
                        writable: true,
                    });
                    previewEntireDialogue("editorpreview");
                }
            } else {
                playStartupDialogue();
            }
        })
        .catch(playStartupDialogue);
} catch (e) {
    playStartupDialogue();
}
