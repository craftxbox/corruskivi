type DialogueLine = {
    actor: string;
    text: string;
    class?: string;
    exec?: () => void;
    texec?: () => string;
};

type DialogueResponse = {
    name: string;
    replies: DialogueReply[];
};

type DialogueReply = DialogueLine & {
    name: string | (() => string);
    destination: string;
    exec?: () => void;
    showIf?: any[][];
    definition?: string;
    unreadCheck?: () => boolean;
    hideRead?: boolean;
    fakeEnd?: string | boolean;
};

type DialogueBranch = {
    name: string;
    body?: DialogueLine[];
    responses?: DialogueResponse[];
    end?: () => void;
};

type Dialogue = {
    [key: string]: DialogueChain;
};

type Actor = {
    name?: string;
    image?: string;
    type?: string;
    element?: string;
    elementID?: string; // TODO find the difference between element and elementID
    class?: string;
    player?: boolean;
    noProcess?: boolean;
    expression?: string;
    expressions?: {
        [key: string]: Actor & {exec?: Function};
    }
    voice?: (() => void)| false;
    activeVoice?: (() => void) | false;
};