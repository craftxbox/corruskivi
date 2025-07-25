import { processAnnotations, type AnnotationResult } from "./annotations";
import { postProcessBackground, preProcessBackground } from "./annotations/background";
import { postprocessHowls, preprocessHowls } from "./howl";

export type Changes = {
    dialogue: string;
    changes: { [key: string]: any };
};

export function preProcessDialogue(dialogue: string, noExec = true): string {
    if (noExec) {
        dialogue = preprocessHowls(dialogue);

    }

    return dialogue;
}

export function postProcessDialogue(dialogue: string, noExec = true): string {
    if (noExec) {
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
