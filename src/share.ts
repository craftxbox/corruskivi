type ShareObject = { dialogue: string; actors: string; defines: string, howls: string }

export function makeShareString(dialogue: string, actors: string, defines: string, howls: string) {
    let shareObj: ShareObject = {
        dialogue: dialogue,
        actors: actors,
        defines: defines,
        howls: howls
    };

    return window.LZString.compressToBase64(JSON.stringify(shareObj));
}

export function decodeShareString(shareString: string) {
    try {
        let shareObj;
        if (shareString.length === 10) {
            shareObj = `https://crxb.cc/corruskivi-bin/raw/${shareString}`;
        } else {
            shareObj = window.LZString.decompressFromBase64(shareString);
        }

        if (shareObj.startsWith("https://")) {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", shareObj, false);
            xhr.send();
            if (xhr.status >= 200 && xhr.status < 300) {
                shareObj = xhr.responseText;
            } else {
                window.chatter({ actor: "funfriend", text: `Failed to load shared dialogue from ${shareObj}: ${xhr.statusText}`, readout: true });
                console.error(`Failed to load shared dialogue from ${shareObj}: ${xhr.statusText}`);
                throw new Error("");
            }
        }
        try {
            let data = JSON.parse(shareObj) as ShareObject;
            return data;
        } catch (e) {
            let data = JSON.parse(window.LZString.decompressFromBase64(shareObj)) as ShareObject;
            return data;
        }
    } catch (e) {
        console.error("Error decoding share string:", e);
        return null;
    }
}

export function uploadShareString(shareString: string) {
    const hasteserver = "https://crxb.cc/corruskivi-bin/documents";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", hasteserver, false);
    xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
    xhr.send(shareString);

    if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        return response.key;
    } else {
        console.error("Failed to upload share string:", xhr.statusText);
        return null;
    }
}