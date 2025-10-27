let stylesheet = (document.getElementById("dynamic-styles") as HTMLStyleElement)?.sheet as CSSStyleSheet;

export function processCss(dialogue: string): string {
    while (stylesheet.cssRules.length > 0) {
        stylesheet.deleteRule(0);
    }
    
    let matches = dialogue.matchAll(/^@css +(\S+) +(.+)$/gm);

    for (let match of matches) {
        let fullMatch = match[0];
        let selectorName = match[1];
        let styleContent = match[2];
        
        stylesheet.insertRule(`${selectorName} ${styleContent}`);

        dialogue = dialogue.replace(fullMatch, "");
    }

    return dialogue;
}