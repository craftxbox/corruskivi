import type LZString from "lz-string";
import DOMPurify from "dompurify";
import { previewDialogue } from "./previewDialogue";

import "./saves";
import "./actors";
import "./customactors";
import "./defines";
import { playStartupDialogue } from "./startup";
import { getEditorContent, setEditorContent } from "./monaco";

import "./types.d";
import { getCustomActorsContent, setCustomActorsContent, updateActors } from "./customactors";
import { getDefinesContent, setDefinesContent, updateDefines } from "./defines";
import { loadSlot } from "./saves";
import { decodeShareString, makeShareString, uploadShareString } from "./share";

declare type LZString = typeof LZString;

declare global {
    interface Window {
        startDialogue: (dialogue: string, settings?: { originEntityId?: string; specificChain?: string }) => void;
        endDialogue: (callback?: Function) => void;
        sendDialogue: (branch: DialogueBranch, index: number) => void;
        generateDialogueObject: (dialogue: string) => Dialogue;
        changeBranch: (branch: string) => void;
        changeDialogue: (dialogue: string) => void;
        undoallchanges?: () => void;
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
        LZString: LZString;
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
                [key: string]: string;
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

let testpath: number[][] = [];

export function clearTestPath() {
    testpath = [];
}

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

    let localTestPath = testpath.map((p) => [...p]);
    testpath = [];

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

export function generateEditorDialogue() {
    if (window.undoallchanges) {
        window.undoallchanges();
        delete window.undoallchanges;
    }

    let dialogue = getEditorContent();

    let execCheck = document.querySelector("#enable-exec") as HTMLInputElement;

    if (!execCheck.checked) {
        if (/EXEC::|THEN::|UNREADCHECK::|END::|SKIP::/.test(dialogue)) {
            window.chatter({ actor: "funfriend", text: "Dialogue tried to use forbidden commands to execute code! Refusing to generate this.", readout: true });
            window.env.dialogues["editorpreview"] = window.generateDialogueObject(`start
    sys
        ERROR::'the dialogue editor detected forbidden commands that could execute code'
        ADVISE::'remove EXEC::, THEN::, UNREADCHECK::, END::, or SKIP:: commands from your dialogue'`);
            return;
        }
    }

    if (dialogue.trim() === "") {
        window.chatter({ actor: "funfriend", text: "The editor is empty. Please write some dialogue before previewing.", readout: true });
        return;
    }

    window.location.hash = makeShareString(dialogue, getCustomActorsContent(), getDefinesContent());

    if (dialogue.startsWith("@testpath ")) {
        let path = dialogue.match(/(\d+,\d+)/gm);
        dialogue = dialogue.replace(/^@testpath .*$/m, "");
        if (path && path.length > 0) {
            testpath = path.map((p) => p.split(",").map(Number));
        } else {
            window.chatter({ actor: "funfriend", text: "Invalid @testpath format! Please use @testpath <number> [<number> ...].", readout: true });
            return;
        }
    }

    // if (dialogue.startsWith("@bgm ")) {
    //     let bgm = dialogue.match(/^@bgm (.+)$/m);
    //     dialogue = dialogue.replace(/^@bgm .+$/m, "");
    //     window.page.bgm: new window.Howl({
	// 				onload: function () {window.page.howls.push(this)},
	// 				src: ['/audio/outerhubv1.ogg'],
	// 				preload: true,
	// 				loop: true,
					
					
	// 				sprite: {
	// 					__default: [50, 236000, true]
	// 				}
	// 			}),
    // }

    if (/^@(?:name|respobj) /gm.test(dialogue)) {
        let segments = dialogue.split(/^@/gm);
        if (segments.length < 2) {
            window.chatter({ actor: "funfriend", text: "Invalid dialogue format! Please ensure you have at least one dialogue segment.", readout: true });
            return;
        }

        let firstSegment = segments.shift();
        firstSegment = DOMPurify.sanitize(firstSegment || "");

        window.env.dialogues["editorpreview"] = window.generateDialogueObject(firstSegment);
        let chains: { [key: string]: string } = {};
        let respobjs: { [key: string]: string } = {};
        for (let segment of segments) {
            let match = segment.match(/^(\w+) (.+)\n/);
            if (!match || match.length < 3) {
                window.chatter({ actor: "funfriend", text: "invalid dialogue segment was found! ignoring it.", readout: true });
                continue;
            }
            let type = match[1].trim();
            let name = match[2].trim();
            if (name.length === 0) {
                window.chatter({ actor: "funfriend", text: "invalid dialogue segment was found! ignoring it.", readout: true });
            }
            segment = segment.replace(/^.+\n/, "");
            segment = DOMPurify.sanitize(segment || "");
            switch (type) {
                case "name":
                    chains[name] = segment;
                    break;
                case "respobj":
                    respobjs[name] = segment;
                    break;
                default:
                    window.chatter({ actor: "funfriend", text: `Unknown annotation type: ${type}. ignoring it!`, readout: true });
                    console.error(`Unknown annotation type: ${type}.`);
                    break;
            }
        }
        for (const [key, value] of Object.entries(respobjs)) {
            window.env.dialogues[key] = window.generateDialogueObject(value);
        }

        for (const [key, value] of Object.entries(chains)) {
            window.env.dialogues[key] = window.generateDialogueObject(value);
        }
    } else {
        dialogue = DOMPurify.sanitize(dialogue)
        window.env.dialogues["editorpreview"] = window.generateDialogueObject(dialogue);
    }
}

document.querySelector("#test-dialogue")?.addEventListener("click", () => {
    generateEditorDialogue();

    previewEntireDialogue("editorpreview");
    window.play("muiScanner", 2);
});

document.querySelector("#preview-dialogue")?.addEventListener("click", () => {
    generateEditorDialogue();

    startNewDialogue("editorpreview");
    window.play("muiScanner", 2);
});

document.querySelector("#start-dialogue")?.addEventListener("click", () => {
    enterDirectPreview();
    window.play("muiScanner", 2);
});

document.querySelector("#share-editor-dialogue")?.addEventListener("click", () => {
    generateEditorDialogue();
    previewEntireDialogue("editorpreview");
    window.play("talk", 2);

    share();
});

document.querySelector("#share-dialogue")?.addEventListener("click", () => {
    generateEditorDialogue();
    previewEntireDialogue("editorpreview");
    window.play("talk", 2);
    
    share("preview");
});

function share(location: string = "") {
    let shareString = makeShareString(getEditorContent(), getCustomActorsContent(), getDefinesContent());
    let shareUrl = uploadShareString(shareString);

    let url = window.location.href.replace(window.location.hash,"") + location + "#" + shareUrl;
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
    if (window.env.currentDialogue && window.env.currentDialogue.active) {
        window.endDialogue();
    }
});

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
    let data = decodeShareString(window.location.hash.slice(1));

    if (data) {
        let direct = window.location.pathname.endsWith("preview");
        setEditorContent(data.dialogue);
        setCustomActorsContent(data.actors);
        setDefinesContent(data.defines);

        updateActors();
        updateDefines();

        generateEditorDialogue();
        if (direct) {
            enterDirectPreview();
        } else previewEntireDialogue("editorpreview");
    } else {
        loadSlot(localStorage.getItem("lastSave") || "save_0", true);
        playStartupDialogue();
    }
} catch (e) {
    loadSlot(localStorage.getItem("lastSave") || "save_0", true);
    playStartupDialogue();
}
