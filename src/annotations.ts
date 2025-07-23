import { processChains } from "./annotations/chain";
import { processTestPath } from "./annotations/testpath";

export type AnnotationResult = {
    dialogue: string;
    chains: { [key: string]: string };
    chainOrder: string[];
};

export function processAnnotations(dialogue: string, _noExec: boolean): AnnotationResult {
    dialogue = processTestPath(dialogue);
    let result = processChains(dialogue);
    return result
}