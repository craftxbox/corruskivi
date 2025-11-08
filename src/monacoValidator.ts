import * as monaco from "monaco-editor";
import { preprocessHowls } from "./howl";
import { preprocessNavigation } from "./navigation";

let line = "";
let lineNumber = 0;
let lines: string[] = [];
let markers: monaco.editor.IMarkerData[] = [];
let i = 0;
let currentChain = "";
let branches: { [chain: string]: { [branch: string]: boolean } } = {};
let testpath: boolean | null = null;
let initialActorDefined: boolean | null = null;
let initialTextDefined: boolean | null = null;

export function validate(model: monaco.editor.ITextModel) {
    lines = model.getLinesContent();
    markers = [];
    branches = { editorpreview: {} };
    currentChain = "editorpreview";
    line = "";
    lineNumber = 0;
    i = 0;
    testpath = null;
    initialActorDefined = null;
    initialTextDefined = null;

    for (i = 0; i < lines.length; i++) {
        line = lines[i];

        if (line.startsWith("@name")) {
            currentChain = line.substring(5).trim();
            branches[currentChain] = {};
            continue;
        }

        if (line.match(/^[^ @]/)) {
            if (branches[currentChain][line] === false) {
                branches[currentChain][`____REUSE____${line}`] = true;
            }
            branches[currentChain][line] = false; // mark branch as defined but not used
        }

        if (line.startsWith("@background")) {
            if (branches[currentChain]["____BACKGROUND____"] === false) {
                branches[currentChain]["____BACKGROUND____"] = true;
            } else if (branches[currentChain]["____BACKGROUND____"] === undefined) {
                branches[currentChain]["____BACKGROUND____"] = false;
            }
        }

        if (line.startsWith("@foreground")) {
            if (branches[currentChain]["____FOREGROUND____"] === false) {
                branches[currentChain]["____FOREGROUND____"] = true;
            } else if (branches[currentChain]["____FOREGROUND____"] === undefined) {
                branches[currentChain]["____FOREGROUND____"] = false;
            }
        }

        if (line.startsWith("@testpath")) {
            if (testpath === false) {
                testpath = true;
            } else if (testpath === null) {
                testpath = false;
            }
        }

        if (line.startsWith("@initial-actor")) {
            if (initialActorDefined === false) {
                initialActorDefined = true;
            } else if (initialActorDefined === null) {
                initialActorDefined = false;
            }
        }

        if (line.startsWith("@initial-text")) {
            if (initialTextDefined === false) {
                initialTextDefined = true;
            } else if (initialTextDefined === null) {
                initialTextDefined = false;
            }
        }
    }

    currentChain = "editorpreview";

    for (i = 0; i < lines.length; i++) {
        line = lines[i];
        lineNumber = i + 1;

        if (line.trim() === "") continue;

        checkCommandsAttachedToDialogue();

        checkBadCaseCommands();

        checkUnprocessedExec();

        checkNameAnnotation();

        checkRespObjAnnotation();

        checkDuplicateAnnotations();

        checkDuplicateBranches();

        checkActorExists();

        checkResponseTargetExists();
    }

    currentChain = "editorpreview";

    for (i = 0; i < lines.length; i++) {
        line = lines[i];
        lineNumber = i + 1;

        if (line.trim() === "") continue;

        if (line.startsWith("@name")) {
            currentChain = line.substring(5).trim();
        }

        checkBranchInUse();

        checkChainInUse();
    }

    monaco.editor.setModelMarkers(model, "owner", markers);
}

function checkCommandsAttachedToDialogue() {
    if (line.startsWith("    ".repeat(3))) {
        let lastLine = lines[i - 1];
        if (!lastLine.startsWith("    ".repeat(2))) {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: "Commands must be attached to a dialogue line.",
                startLineNumber: lineNumber,
                startColumn: 13,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
    }
}

function checkBadCaseCommands() {
    let match = line.match(/(?:    ){3}(\w*)::/);
    if (match) {
        let command = match[1];
        if (command !== command.toUpperCase()) {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: `Command "${command}" must be uppercase.`,
                startLineNumber: lineNumber,
                startColumn: 13,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
        return;
    }

    match = line.match(/(?:    ){1}(RESPONSES|RESPOBJ)::/i);
    if (match) {
        let command = match[1];
        if (command !== command.toUpperCase()) {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: `${command.toUpperCase()}:: must be uppercase.`,
                startLineNumber: lineNumber,
                startColumn: 5,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
    }
}

function checkUnprocessedExec() {
    let execCheck = document.getElementById("enable-exec") as HTMLInputElement;
    let processedLine = preprocessHowls(line, true);
    processedLine = preprocessNavigation(processedLine, true);
    if (processedLine.includes("EXEC::") || /THEN::|UNREADCHECK::|[ _]END::|SKIP::/.test(line)) {
        markers.push({
            severity: execCheck.checked ? monaco.MarkerSeverity.Info : monaco.MarkerSeverity.Error,
            message: "This unsafe command requires the 'Enable EXEC commands' option to be enabled and cannot be shared as a memory.",
            startLineNumber: lineNumber,
            startColumn: 13,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
        });
    }
}

function checkNameAnnotation() {
    if (line.startsWith("@name")) {
        let name = line.substring(5).trim();
        if (name === "") {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: "Dialogue chain name cannot be empty.",
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }

        currentChain = name;

        let foundStart = false;
        for (let j = i + 1; j < lines.length; j++) {
            let nextLine = lines[j];
            if (nextLine.startsWith("start")) {
                foundStart = true;
                break;
            }
            if (nextLine.startsWith("@name") || nextLine.startsWith("@respobj")) {
                foundStart = false;
                break;
            }
        }
        if (!foundStart) {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: `Dialogue chain name "${name}" contain a "start" branch.`,
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
    }
}

function checkRespObjAnnotation() {
    if (line.startsWith("@respobj")) {
        let name = line.substring(5).trim();
        if (name === "") {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: "Dialogue chain name cannot be empty.",
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }

        currentChain = name;

        let foundResponses = false;
        for (let j = i + 1; j < lines.length; j++) {
            let nextLine = lines[j];
            if (nextLine.startsWith("RESPOBJ::")) {
                foundResponses = true;
                break;
            }
            if (nextLine.match(/^[^@]/)) {
                markers.push({
                    severity: monaco.MarkerSeverity.Error,
                    message: `Response object must start with RESPOBJ::`,
                    startLineNumber: j + 1,
                    startColumn: 1,
                    endLineNumber: j + 1,
                    endColumn: nextLine.length + 1,
                });
            }
            if (nextLine.startsWith("@name") || nextLine.startsWith("@respobj")) {
                foundResponses = false;
                break;
            }
        }
        if (!foundResponses) {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: `Response object "${name}" must contain one or more "    RESPONSES::" blocks.`,
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
    }
}

function checkDuplicateAnnotations() {
    if (line.startsWith("@background")) {
        if (branches[currentChain]["____BACKGROUND____"] === true) {
            markers.push({
                severity: monaco.MarkerSeverity.Warning,
                message: `Duplicate @background annotation in chain "${currentChain}". Only the last annotation in a chain will be used.`,
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
    }

    if (line.startsWith("@foreground")) {
        if (branches[currentChain]["____FOREGROUND____"] === true) {
            markers.push({
                severity: monaco.MarkerSeverity.Warning,
                message: `Duplicate @foreground annotation in chain "${currentChain}". Only the last annotation in a chain will be used.`,
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
    }

    if (line.startsWith("@testpath")) {
        if (testpath === true) {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: `Duplicate @testpath annotation. Only one @testpath annotation is allowed.`,
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
    }

    if (line.startsWith("@initial-actor")) {
        if (initialActorDefined === true) {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: `Duplicate @initial-actor annotation. Only one @initial-actor annotation is allowed.`,
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
    }

    if (line.startsWith("@initial-text")) {
        if (initialTextDefined === true) {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: `Duplicate @initial-text annotation. Only one @initial-text annotation is allowed.`,
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
    }
}

function checkDuplicateBranches() {
    if (!line.match(/^[^ ]/)) return; // skip anything that's not indent level 0
    if (line.startsWith("@name") || line.startsWith("@respobj") || line.startsWith("RESPOBJ::")) return;

    if (branches[currentChain][`____REUSE____${line}`] === true) {
        markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: `Duplicate branch "${line}" in chain "${currentChain}". Branch names must be unique within a chain.`,
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
        });
    }
}

function checkActorExists() {
    if (line.includes("RESPOBJ::")) return; // skip checking RESPOBJ lines
    if (!line.match(/^    [^ ]/)) return; // skip anything that's not indent level 1

    let actor;
    if (/^    RESPONSES::/i.test(line)) actor = line.split(/^    RESPONSES::/i)[1].trim();
    else if (line.startsWith("    RESPOBJ::") == false) {
        actor = line.substring(4).trim();
    }

    if (!actor) return;

    let expression;
    if (actor.includes("::")) {
        expression = actor.split("::")[1].trim();
        actor = actor.split("::")[0].trim();
    }

    if (window.env.dialogueActors[actor] === undefined) {
        markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: `No such actor "${actor}" was found. Did you remember to save your custom actors?`,
            startLineNumber: lineNumber,
            startColumn: 5,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
        });
        return;
    }

    if (!expression) return;

    let actorObj = window.env.dialogueActors[actor] as any;

    if (actorObj.expressions === undefined) {
        markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: `Actor "${actor}" does not have any expressions defined.`,
            startLineNumber: lineNumber,
            startColumn: 5,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
        });
        return;
    }

    if (actorObj.expressions[expression] === undefined) {
        markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: `Actor "${actor}" does not have an expression "${expression}" defined.`,
            startLineNumber: lineNumber,
            startColumn: 5,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
        });
        return;
    }
}

function checkResponseTargetExists() {
    if (/^        [^ ]/.test(line) == false) return; // skip anything that's not indent level 2
    if (line.includes("<+>") == false) return; // skip lines without targets

    let target = line.split("<+>")[1]?.trim();

    if (target === "END") return; // skip END targets

    if (target.startsWith("CHANGE::")) {
        target = target.substring(8).trim();
        if (!branches[target]) {
            markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: `No such dialogue chain "${target}" was found.`,
                startLineNumber: lineNumber,
                startColumn: 9,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        } else {
            branches[target]["____INUSE____"] = true; // mark this chain as used
        }
        return;
    }

    if (target && branches[currentChain][target] === undefined) {
        markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: `No such branch "${target}" was found in chain "${currentChain}".`,
            startLineNumber: lineNumber,
            startColumn: 9,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
        });
    } else {
        branches[currentChain][target] = true; // mark this branch as used
    }
}

function checkBranchInUse() {
    if (/^[^ ]/.test(line) == false) return; // skip anything that's not indent level 0

    // skip annotations and ____SHOWIF
    if (line.startsWith("@name") || line.startsWith("@respobj") || "____") return;

    if (line === "start") return; // skip start branch

    if (branches[currentChain][line] === false) {
        markers.push({
            severity: monaco.MarkerSeverity.Warning,
            message: `Branch "${line}" in chain "${currentChain}" is never used.`,
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
        });
    }
}

function checkChainInUse() {
    if (line.startsWith("@name")) {
        if (branches[currentChain]["____INUSE____"] === undefined && currentChain !== "editorpreview") {
            markers.push({
                severity: monaco.MarkerSeverity.Warning,
                message: `Dialogue chain "${currentChain}" is never used.`,
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: line.length + 1,
            });
        }
    }
}
