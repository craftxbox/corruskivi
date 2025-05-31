let playlist: string[] = [];

function init() {
    if( playlist.length > 0) return; // Already initialized
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://r2-vapor.crxb.cc/list.m3u8", false);
    xhr.send();

    if (xhr.status < 200 || xhr.status >= 300) throw new Error(`Failed to load vapor list: ${xhr.status} ${xhr.statusText}`);
    
    playlist = xhr.responseText.trim().split("\n").filter(line => line && !line.startsWith("#"));
}

function play() {
    let randomIndex = Math.floor(Math.random() * playlist.length);
    let audioUrl = "https://r2-vapor.crxb.cc/" + playlist[randomIndex];
    audioUrl = decodeURIComponent(audioUrl);

    let env = (window.env as any)
    env?.bgm?.unload();
    env.vaporwave = true;

    let howl = new window.Howl({
        src: [audioUrl],
        format: ["mp3"],
        preload: true,
        volume: (window as any).getModifiedVolume('music', env?.bgm?.intendedVol ? env.bgm.intendedVol : 1),
        onload: () => {
            env.bgm = howl;
            howl.play();
        },
        onend: () => {
            play();
        },
        onloaderror: (_, error) => {
            console.error("Failed to load vaporwave track: "+ audioUrl, error);
        }

    })
}

function stop() {
    let env = (window.env as any)
    if (env?.bgm) {
        env.bgm.stop();
        env.bgm.unload();
    }
    env.vaporwave = false;
}

if (!window.hasOwnProperty("silly")) {
    Object.defineProperty(window, "silly", {
        value: {
            vapor: {
                init: init,
                play: play,
                stop: stop
            }
        },
        writable: false,
        configurable: false
    });
} else {
    Object.defineProperty((window as any)["silly"], "vapor", {
        value: {
            init: init,
            play: play,
            stop: stop,
        },
        writable: false,
        configurable: false
    });
}