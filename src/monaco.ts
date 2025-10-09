import "./userWorker";
import * as monaco from "monaco-editor";
import { type IRange } from "monaco-editor";
import { validate } from "./monacoValidator";

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
            if (i === model.getLineCount() - 1 && startLine !== -1) {
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

            if (i === model.getLineCount() - 1 && startLine !== -1) {
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

            if (i === model.getLineCount() - 1 && startLine !== -1) {
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

                    if (j === model.getLineCount() - 1) {
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

function createAnnotationProposals(range: IRange) {
    return [
        {
            label: "@name",
            kind: monaco.languages.CompletionItemKind.Property,
            documentation: "Declare a new dialogue chain",
            insertText: "@name ",
            range: range,
        },
        {
            label: "@respobj",
            kind: monaco.languages.CompletionItemKind.Property,
            documentation: "Declare a new response object",
            insertText: "@respobj ",
            range: range,
        },
        {
            label: "@testpath",
            kind: monaco.languages.CompletionItemKind.Property,
            documentation: "Set a path for the test button to follow",
            insertText: "@testpath ",
            range: range,
        },
        {
            label: "@background",
            kind: monaco.languages.CompletionItemKind.Property,
            documentation: "Set the background image for the dialogue",
            insertText: "@background ",
            range: range,
        },
        {
            label: "@foreground",
            kind: monaco.languages.CompletionItemKind.Property,
            documentation: "Set the foreground image for the dialogue",
            insertText: "@foreground ",
            range: range,
        },
    ];
}

function createRootCmdProposals(range: IRange) {
    return [
        {
            label: "____SHOWIF::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Show this dialogue only if the condition is met",
            insertText: '____SHOWIF::[["fbx__${1:editorpreview}_${2:branch}"]]',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
        },
        {
            label: "____NESTIF::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Start a nested condition block",
            insertText: '____NESTIF::[["fbx__${1:editorpreview}_${2:branch}"]]',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
        },
        {
            label: "____END",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "End the current dialogue block",
            insertText: "____END",
            range: range,
        },
    ];
}

function createActorProposals(range: IRange, response = false) {
    let proposals = [];
    for (let actor in window.env.dialogueActors) {
        if (window.env.dialogueActors.hasOwnProperty(actor)) {
            proposals.push({
                label: (response ? "RESPONSES::" : "") + actor,
                kind: monaco.languages.CompletionItemKind.Class,
                documentation: `Dialogue actor: ${actor}`,
                insertText: (response ? "RESPONSES::" : "") + actor + "\n    ",
                range: range,
                preselect: actor === "self",
            });
        }
    }
    return proposals;
}

function createCommandProposals(range: IRange) {
    return [
        {
            label: "AUTOADVANCE::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Automatically advance to the next dialogue once this one is shown",
            insertText: "AUTOADVANCE::",
            range: range,
        },
        {
            label: "WAIT::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Wait for a certain amount of milliseconds before continuing",
            insertText: "WAIT::${1:1000}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
        },
        {
            label: "CLASS::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Set a CSS class for the dialogue box",
            insertText: "CLASS::${1:classname}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
        },
        {
            label: "SHOWONCE::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Show this dialogue only once per session",
            insertText: "SHOWONCE::",
            range: range,
        },
        {
            label: "SHOWIF::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Show this dialogue only if the condition is met",
            insertText: 'SHOWIF::[["fbx__${1:editorpreview}_${2:branch}"]]',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
        },
    ];
}

function createExecCommandProposals(range: IRange) {
    return [
        {
            label: "EXEC::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Execute javascript immediately",
            insertText: "EXEC::",
            range: range,
        },
        {
            label: "END::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Execute javascript when the dialogue ends",
            insertText: "END::",
            range: range,
        },
        {
            label: "THEN::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Execute javascript after a WAIT:: completes",
            insertText: "THEN::",
            range: range,
        },
        {
            label: "SKIP::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Add a skip button and execute javascript when clicked",
            insertText: "SKIP::",
            range: range,
        },
        {
            label: "SKIPNOTICE::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Set the warning notice for the skip button",
            insertText: "SKIPNOTICE::${1:Are you sure you want to skip this dialogue?}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
        },
        {
            label: "SKIPTIME::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Set the time in milliseconds the skip overlay will be shown",
            insertText: "SKIPTIME::${1:1000}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
        },
    ];
}

function createResponseProposals(model: monaco.editor.ITextModel, range: IRange) {
    let proposals: any[] = [];
    let execCheck = document.getElementById("enable-exec") as HTMLInputElement;
    if (execCheck.checked) {
        proposals.push({
            label: "UNREADCHECK::",
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: "Execute javascript to see if the response will be shown as unread",
            insertText: "UNREADCHECK::",
            range: range,
        });
    }

    for (let i = 0; i < model.getLineCount(); i++) {
        const lineText = model.getLineContent(i + 1);
        let match = lineText.match(/^([a-zA-Z0-9]\w+)/);
        if (match) {
            proposals.push({
                label: match[1],
                kind: monaco.languages.CompletionItemKind.Variable,
                documentation: `Branch: ${match[1]}`,
                insertText: match[1] + "\n    ",
                range: range,
            });
        }

        match = lineText.match(/^\x40name (.+)/);
        if (match) {
            proposals.push({
                label: "CHANGE::" + match[1],
                kind: monaco.languages.CompletionItemKind.Class,
                documentation: `Dialogue chain: ${match[1]}`,
                insertText: "CHANGE::" + match[1] + "\n    ",
                range: range,
            });
        }
    }

    return proposals;
}

function createRespobjProposals(model: monaco.editor.ITextModel, range: IRange) {
    let proposals = [];
    for (let i = 0; i < model.getLineCount(); i++) {
        const lineText = model.getLineContent(i + 1);
        let match = lineText.match(/^@respobj (.+)/);
        if (match) {
            proposals.push({
                label: "RESPOBJ::" + match[1],
                kind: monaco.languages.CompletionItemKind.Variable,
                documentation: `Response object: ${match[1]}`,
                insertText: "RESPOBJ::" + match[1] + "\n    ",
                range: range,
            });
        }
    }
    return proposals;
}

monaco.languages.registerCompletionItemProvider("corru-dialogue", {
    provideCompletionItems: function (model, position) {
        let line = model.getLineContent(position.lineNumber);

        let indentationCount = 0;
        while (line[indentationCount] === " ") {
            indentationCount++;
        }
        let indentationLevel = indentationCount / 4;

        let proposals = [];

        let word = model.getWordUntilPosition(position);

        let lastActor: string | undefined;

        for (let i = position.lineNumber - 1; i > 0; i--) {
            const previousLine = model.getLineContent(i);
            if (previousLine.match(/^    \w/)) {
                lastActor = previousLine.trim();
                break;
            }
        }

        switch (indentationLevel) {
            case 0:
                var range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: 1,
                    endColumn: word.endColumn,
                };

                if (line.startsWith("@")) {
                    proposals.push(createAnnotationProposals(range));
                } else if (line.startsWith("_")) {
                    proposals.push(createRootCmdProposals(range));
                } else {
                    proposals.push([
                        {
                            label: "start",
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            documentation: "Default branch for a chain",
                            insertText: "start\n    ",
                            range: range,
                        },
                    ]);
                }

                break;
            case 1:
                var range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                if (word.word.match(/^RESPOB/i)) {
                    proposals.push(createRespobjProposals(model, range));
                } else if (word.word.match(/^RESP/i)) {
                    proposals.push(createActorProposals(range, true));
                } else {
                    proposals.push(createActorProposals(range));
                }
                break;
            case 2:
                if (lastActor === undefined) break;

                var range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                if (lastActor.startsWith("RESPONSES::")) {
                    if (line.includes("<+>")) {
                        proposals.push(createResponseProposals(model, range));
                    }
                }

                break;
            case 3:
                var range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                if (lastActor?.startsWith("RESPONSES::")) {
                    proposals.push([
                        {
                            label: "FAKEEND::",
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            documentation: "Make the response button look like it ends the dialogue",
                            insertText: "FAKEEND::${1:(back)}",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: range,
                        },
                    ]);
                }

                proposals.push(createCommandProposals(range));

                let execCheck = document.getElementById("enable-exec") as HTMLInputElement;
                if (execCheck.checked) {
                    proposals.push(createExecCommandProposals(range));
                }
                break;
        }

        return {
            suggestions: proposals.flat(),
        };
    },
    triggerCharacters: ["@", "_", ":", ">"],
});

const corruEditor = monaco.editor.create(editorContainer, {
    language: "corru-dialogue",
    automaticLayout: true,
    theme: "vs-dark",
});

const model = corruEditor.getModel();

let validateTimeout: ReturnType<typeof setTimeout>;

if (model) {
    model.setEOL(monaco.editor.EndOfLineSequence.LF);
    model.onDidChangeContent(() => {
        if (validateTimeout) clearTimeout(validateTimeout);
        validateTimeout = setTimeout(() => {
            validate(model);
        }, 500);
    });
    validate(model);
}

export function getEditorContent(): string {
    return corruEditor.getValue();
}

export function setEditorContent(content: string): void {
    // WE HATE CRLF.
    content = content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
    corruEditor.setValue(content);
    model?.setEOL(monaco.editor.EndOfLineSequence.LF);
}

let dialogue = window.localStorage.getItem("dialogue");

if (dialogue) setEditorContent(dialogue);
