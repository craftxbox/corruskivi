import type { AnnotationResult } from "../annotations";
import DOMPurify from "dompurify";

const purifyopts = {
    ADD_TAGS: ["+"],
    ADD_ATTR: ["definition"],
};

DOMPurify.addHook("uponSanitizeAttribute", function (node, data) {
    if (data.attrName === "definition") {
        data.forceKeepAttr = true;
        node.setAttribute("definition", DOMPurify.sanitize(data.attrValue));
    }
});

export function processChains(dialogue: string): AnnotationResult {
    if (/^@(?:name|respobj) /gm.test(dialogue)) {
        dialogue = dialogue.replaceAll(/^@(name|respobj)/gm, "__@$1");
        let segments = dialogue.split(/^__@/gm);
        if (segments.length < 2) {
            let text = "Invalid dialogue format! Please ensure you have at least one dialogue segment.";
            window.chatter({ actor: "funfriend", text, readout: true });
            throw new Error(text);
        }

        let chainOrder: string[] = [];
        let respOrder: string[] = [];
        let firstSegment = processSegment(segments.shift() || "");

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
            segment = processSegment(segment);
            switch (type) {
                case "name":
                    chains[name] = segment;
                    chainOrder.push(name);
                    break;
                case "respobj":
                    respobjs[name] = segment;
                    respOrder.push(name);
                    break;
                default:
                    window.chatter({ actor: "funfriend", text: `Unknown annotation type: ${type}. ignoring it!`, readout: true });
                    console.error(`Unknown annotation type: ${type}.`);
                    break;
            }
        }

        dialogue = dialogue.replaceAll(/^@.+$/gm, "");

        return {
            dialogue: dialogue,
            chains: { editorpreview: firstSegment, ...respobjs, ...chains },
            chainOrder: [...respOrder, ...chainOrder, "editorpreview"],
        };
    } else
        return {
            dialogue: dialogue,
            chains: { editorpreview: processSegment(dialogue) },
            chainOrder: ["editorpreview"],
        };
}

function processSegment(segment: string) {
    let newSegment = segment.replaceAll(/<\+>/g, "__RESP_SEPARATOR__");
    newSegment = DOMPurify.sanitize(newSegment, purifyopts);
    newSegment = newSegment.replaceAll("__RESP_SEPARATOR__", "<+>");
    return newSegment;
}
