import { clone } from "./clone";
import * as monaco from "monaco-editor";
import { generateEditorDialogue } from "./main";

monaco.languages.register({ id: "custom-defines" });
monaco.languages.setMonarchTokensProvider("custom-defines", {
    defaultToken: "invalid",
    tokenizer: {
        root: [[/^([^:]*)(:)(.*)/, ["keyword", "operators", "string"]]],
    },
});

const editorContainer = document.getElementById("defines") as HTMLElement;
const definesEditor = monaco.editor.create(editorContainer, {
    language: "custom-defines",
    automaticLayout: true,
    theme: "vs-dark",
});

const model = definesEditor.getModel();
if (model) {
    model.setEOL(monaco.editor.EndOfLineSequence.LF);
}

export function getDefinesContent(): string {
    return definesEditor.getValue();
}

export function setDefinesContent(content: string): void {
    // WE HATE CRLF
    content = content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
    definesEditor.setValue(content);
    model?.setEOL(monaco.editor.EndOfLineSequence.LF);
}

let originalDefines = clone(window.env.definitions);

export function updateDefines() {
    let defines = getDefinesContent().trim();
    window.env.definitions = clone(originalDefines);
    delete window.page.formedDefinitionStrings;
    for (let line of defines.split("\n")) {
        if (line.startsWith("env.definitions")) {
            try {
                let json = line.match(/^env\.definitions\[['"`](.*?)['"`]\] = (.*)/);
                if (json && json[2]) {
                    let value = json[2].trim().replace(/;*$/, ""); // remove trailing semicolons
                    
                    // best-effort attempt to turn a js object into a JSON object
                    value = value.replaceAll("'", '"');
                    value = value.replaceAll(/[ ,]*(\w+)\s*:/g, ',"$1":');
                    value = value.replaceAll("{,", "{");
                    value = JSON.parse(value);
                    
                    window.env.definitions[json[1]] = value;
                    continue;
                }
            } catch (e) {
                console.error("Failed to evaluate defines content:", e);
                window.chatter({ actor: "actual_site_error", text: "An error occurred while evaluating your definitions. Please check the console for details.", readout: true });
                continue;
            }
        }

        let split = line.indexOf(":");
        if (split === -1) continue;
        let key = line.slice(0, split).trim();
        let value = line.slice(split + 1).trim();
        if (key && value) {
            if (value.split("::").length > 1) {
                let type = value.split("::")[0].trim();
                value = value.split(type + "::")[1].trim();
                window.env.definitions[key] = { type: type, text: value };
            } else window.env.definitions[key] = value;
        }
    }
}

setDefinesContent(localStorage.getItem("defines") || "");

updateDefines();

document.querySelector("#save-defines")?.addEventListener("click", () => {
    let defines = getDefinesContent().trim();
    localStorage.setItem("defines", defines);
    updateDefines();
    window.chatter({ actor: "funfriend", text: "Custom definitions saved successfully.", readout: true });
    window.play("talk", 2);
    generateEditorDialogue();
});
