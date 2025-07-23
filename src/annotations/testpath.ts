let testpath: number[][] = [];

export function getTestPath(): number[][] {
    return testpath;
}

export function clearTestPath() {
    testpath = [];
}

export function processTestPath(dialogue: string): string {
    if (dialogue.match(/^@testpath (.+)$/m)) {
        let match = dialogue.match(/^@testpath (.+)$/m);
        if (!match) throw new Error("WTF: (Testpath) Matched one but not the other?")

        let path = match[1].match(/(\d+,\d+)/gm);
        dialogue = dialogue.replace(/^@testpath .*$/m, "");
        if (path && path.length > 0) {
            testpath = path.map((p) => p.split(",").map(Number));
        } else {
            let text = "Invalid @testpath format! Please use @testpath <number> [<number> ...]."
            window.chatter({ actor: "funfriend", text, readout: true });
            throw new Error(text);
        }
    }
    return dialogue;
}
