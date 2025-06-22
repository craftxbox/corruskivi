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
            [/^(____[A-Z]+)(::)(.*)/, ["keyword", "operators", "string"]],
            [/^(____END$)/, "keyword"],
            [/^(        [A-Z]+)(::)(.*)/, ["keyword", "operators", "string"]],
            [/^(            [A-Z]+)(::)(.*)/, ["keyword", "operators", "string"]],
            [/^(        .+)(<\+>)(.+)/, ["string", "keyword", "identifier"]],
            [/^    [^ ].+/, "type"],
            [/^        [^ ].+/, "string"],
            [/^(\x40name )(.+)/, ["keyword", "string"]],
            [/^(\x40respobj )(.+)/, ["keyword", "string"]],
            [/^(\x40testpath )([\d, ]+)/, ["keyword", "string"]],
            [/^(\x40background )(.+)/, ["keyword", "string"]],
            [/^(\x40foreground )(.+)/, ["keyword", "string"]],
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
monaco.languages.registerFoldingRangeProvider("corru-dialogue", {
    provideFoldingRanges: (model, _context, _token) => {
        const ranges = [];
        let startLine = -1;
        let endLine = -1;

        // fold branches
        for (let i = 0; i < model.getLineCount(); i++) {
            if (i === (model.getLineCount() - 1) && startLine !== -1) {
                endLine = i + 1; // Last line of the file
                ranges.push({
                    start: startLine,
                    end: endLine,
                    kind: monaco.languages.FoldingRangeKind.Region,
                });
            }

            const lineText = model.getLineContent(i + 1);

            if (lineText.match(/\x40(name|respobj)/) && startLine === -1) {
                endLine = i; // End of the current block
                ranges.push({
                    start: startLine,
                    end: endLine,
                    kind: monaco.languages.FoldingRangeKind.Region,
                });
                startLine = -1;
                endLine = -1;
            }

            if (lineText.startsWith("____") || lineText.startsWith("    ")) continue;

            if (lineText.match(/[a-zA-Z0-9_]+$/)) {
                if (startLine === -1) {
                    startLine = i + 1; // Start of a new block
                } else {
                    endLine = i; // End of the current block
                    ranges.push({
                        start: startLine,
                        end: endLine,
                        kind: monaco.languages.FoldingRangeKind.Region,
                    });
                    startLine = i + 1; // Reset for the next block
                }
            }
        }

        // fold chains
        startLine = -1;
        endLine = -1;
        for (let i = 0; i < model.getLineCount(); i++) {
            const lineText = model.getLineContent(i + 1);

            if (i === (model.getLineCount() - 1) && startLine !== -1) {
                endLine = i + 1; // Last line of the file
                ranges.push({
                    start: startLine,
                    end: endLine,
                    kind: monaco.languages.FoldingRangeKind.Region,
                });
            }

            if (!(lineText.startsWith("@name") || lineText.startsWith("@respobj"))) continue;

            if (lineText.match(/^\x40(name|respobj)/)) {
                if (startLine === -1) {
                    startLine = i + 1; // Start of a new block
                } else {
                    endLine = i; // End of the current block
                    ranges.push({
                        start: startLine,
                        end: endLine,
                        kind: monaco.languages.FoldingRangeKind.Region,
                    });
                    startLine = i + 1; // Reset for the next block
                }
            }

        }

        // fold SHOWIFs
        startLine = -1;
        endLine = -1;
        for (let i = 0; i < model.getLineCount(); i++) {
            const lineText = model.getLineContent(i + 1);

            if (i === (model.getLineCount() - 1) && startLine !== -1) {
                endLine = i + 1; // Last line of the file
                ranges.push({
                    start: startLine,
                    end: endLine,
                    kind: monaco.languages.FoldingRangeKind.Region,
                });
            }

            if (!lineText.startsWith("____")) continue;

            if (lineText.match(/^____(SHOWIF|NESTIF)/)) {
                startLine = i + 1; // Start of a new block
                let innerBlocks = 0;
                for (let j = i + 1; j < model.getLineCount(); j++) {
                    const innerLineText = model.getLineContent(j + 1);

                    if (innerLineText.match(/^____(SHOWIF|NESTIF)/)) {
                        innerBlocks++;
                    }

                    if (innerLineText.startsWith("____END")) {
                        if (innerBlocks > 0) {
                            innerBlocks--;
                            continue; // Skip the end line if there are inner blocks
                        }

                        endLine = j + 1; // End of the current block
                        ranges.push({
                            start: startLine,
                            end: endLine,
                            kind: monaco.languages.FoldingRangeKind.Region,
                        });
                        startLine = -1; // Reset for the next block
                        break;
                    }

                    if (j === (model.getLineCount() - 1)) {
                        endLine = j + 1; // Last line of the file
                        ranges.push({
                            start: startLine,
                            end: endLine,
                            kind: monaco.languages.FoldingRangeKind.Region,
                        });
                        startLine = -1; // Reset for the next block
                    }
                }
            }
        }

        return ranges;
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

let dialogue = window.localStorage.getItem("dialogue");

if (dialogue) setEditorContent(dialogue);
