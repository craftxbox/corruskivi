import { processAnnotations, type AnnotationResult } from "./processors/annotations";
import { postProcessBackground, preProcessBackground } from "./annotations/background";
import { preProcessEasyScript } from "./processors/easyscript";
import { postprocessHowls, preprocessHowls } from "./processors/howl";
import { postprocessNavigation, preprocessNavigation } from "./processors/navigation";
import { postprocessBgm, preprocessBgm } from "./processors/bgm";
import { postprocessChange, preprocessChange } from "./processors/change";

export type Changes = {
    dialogue: string;
    changes: { [key: string]: any };
};

export function preProcessDialogue(dialogue: string, noExec = true): string {
    dialogue = preProcessEasyScript(dialogue);
    if (noExec) {
        dialogue = preprocessHowls(dialogue);
        dialogue = preprocessNavigation(dialogue);
        dialogue = preprocessBgm(dialogue);
        dialogue = preprocessChange(dialogue);
    }



    return dialogue;
}

export function postProcessDialogue(dialogue: string, noExec = true): string {
    if (noExec) {
        dialogue = postprocessChange(dialogue);
        dialogue = postprocessBgm(dialogue);
        dialogue = postprocessNavigation(dialogue);
        dialogue = postprocessHowls(dialogue);
    }

    return dialogue;
}

export function processChains(dialogue: string, noExec: boolean): AnnotationResult {
    return processAnnotations(dialogue, noExec);
}

export function preProcessChain(dialogue: string): Changes {
    let changes = { dialogue, changes: {} };
    changes = preProcessBackground(changes);
    return changes;
}

export function postProcessChain(chain: string, changes: { [key: string]: any }): void {
    postProcessBackground(chain, changes);
}
