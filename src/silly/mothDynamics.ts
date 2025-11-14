const mothLines: {[key: string]: string[][]} = {
    "illegalEditor": [
        [
            "huh, your editor has that?",
            "i dont think i've seen that in any standard release",
            "you might not just have the leaked mindsci version like everyone else",
            "could be one of the underground hacked editions?",
        ], 
        [
            "yeah ok",
            "that confirms as much",
            "you definitely have a hacked edition",
            "kinda wonder how you always end up with stuff like this"
        ],
        [
            "huh, more hacked stuff i think",
            "havent heard of this one before",
            "knew you were in some stuff but never thought you were that deep",
            "glad we're off the log for this, lol"
        ],
        [
            "i haven't thought this far yet",
            "when i wrote these there was only one feature it popped up for",
            "so",
            "have this awkward fourth wall breaking dev talk instead"
        ]
    ]
}

function getMothLine(key: string, line: number) {
    const level: number = window.check(key)
    return mothLines[key][level-1][line-1];
}

if (!window.hasOwnProperty("silly")) {
    Object.defineProperty(window, "silly", {
        value: {
            getMothLine: getMothLine
        },
        writable: false,
        configurable: false
    });
} else {
    Object.defineProperty((window as any)["silly"], "getMothLine", {
        value: getMothLine,
        writable: false,
        configurable: false
    });
}