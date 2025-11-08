import DOMPurify from "dompurify";

let startupActor = "sys";
let startupText = "NOTICE::'memory stream located'";

export function processInitialOverrides(dialogue: string): string {
    let actorMatch = dialogue.match(/^@initial-actor (.+)$/m);
    if (actorMatch) {
        startupActor = actorMatch[1].trim();
        dialogue = dialogue.replace(actorMatch[0], "");
    }

    let textMatch = dialogue.match(/^@initial-text (.+)$/m);
    if (textMatch) {
        startupText = DOMPurify.sanitize(textMatch[1].trim());
        dialogue = dialogue.replace(textMatch[0], "");
    }

    return dialogue;
}

export function getInitialActor(): string {
    return startupActor;
}

export function getInitialText(): string {
    return startupText;
}