import { base64url, flattenedVerify } from "jose";

type ShareObject = { dialogue: string; actors: string; defines: string; howls: string };

const execCheck = document.querySelector("#enable-exec") as HTMLInputElement;

let key = {
    crv: "Ed25519",
    x: "OG5CsJNnuMIUEiALXdxOfn0n9gfWsKtsj5ijkRt5LuU",
    kty: "OKP",
};

export function makeShareString(dialogue: string, actors: string, defines: string, howls: string) {
    let shareObj: ShareObject = {
        dialogue: dialogue,
        actors: actors,
        defines: defines,
        howls: howls,
    };

    return window.LZString.compressToBase64(JSON.stringify(shareObj));
}

export async function decodeShareString(shareString: string): Promise<ShareObject | null> {
    try {
        let shareObj;
        if (shareString.length === 10) {
            shareObj = `https://crxb.cc/corruskivi-bin/raw/${shareString}`;
        } else {
            shareObj = window.LZString.decompressFromBase64(shareString);
        }

        if (!shareObj) return null;

        let signature;
        let originalShareObj = shareObj;

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
            xhr.open("GET", originalShareObj + ".sig", false);
            xhr.send();
            if (xhr.status >= 200 && xhr.status < 300) {
                signature = xhr.responseText;
            }
        }

        if (signature) {
            let jws = {
                signature: signature,
                payload: base64url.encode(shareObj),
            };

            try {
                let result = await flattenedVerify(jws, key);
                if (!result || !result.payload) {
                    console.error("Failed to verify share string signature.");
                } else {
                    execCheck.checked = true;
                    console.log("Share string signature verified successfully.");
                }
            } catch (_e: unknown) {
                console.error("Failed to verify share string signature:", _e);
            }
        }

        try {
            return JSON.parse(shareObj) as ShareObject;
        } catch (e) {
            return JSON.parse(window.LZString.decompressFromBase64(shareObj)) as ShareObject;
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
