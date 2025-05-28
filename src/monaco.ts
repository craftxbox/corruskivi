import * as monaco from "monaco-editor";

const editorContainer = document.getElementById("editor-text") as HTMLElement;

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
});

monaco.languages.register({ id: "corru-dialogue" });
monaco.languages.setMonarchTokensProvider("corru-dialogue", {
    defaultToken: "invalid",
    tokenizer: {
        root: [
            [/^(    [A-Z]+)(::)(.*)/, ["keyword", "operators", "string"]],
            [/^(        [A-Z]+)(::)(.*)/, ["keyword", "operators", "string"]],
            [/^(            [A-Z]+)(::)(.*)/, ["keyword", "operators", "string"]],
            [/^(        .+)(<\+>)(.+)/, ["string", "keyword", "identifier"]],
            [/^    [^ ].+/, "type"],
            [/^        [^ ].+/, "string"],
            [/^(\x40name )(.+)/, ["keyword", "string"]],
            [/^(\x40respobj )(.+)/, ["keyword", "string"]],
            [/^(\x40testpath )([\d, ]+)/, ["keyword", "string"]],
            [
                /^\w.*/,
                {
                    cases: {
                        "RESPOBJ::": "keyword",
                        start: "keyword",
                        END: "keyword",
                        "@default": "identifier",
                    },
                },
            ],
        ],
    },
});

const corruEditor = monaco.editor.create(editorContainer, {
    language: "corru-dialogue",
    automaticLayout: true,
    theme: "vs-dark",
});

export function getEditorContent(): string {
    return corruEditor.getValue();
}

export function setEditorContent(content: string): void {
    corruEditor.setValue(content);
}
