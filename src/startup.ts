import { previewEntireDialogue } from "./main";
import { updateActors } from "./customactors";
import { clearTestPath } from "./annotations/testpath";

let env = window.env;

updateActors();
let actors = Object.keys(env.dialogueActors);
let lines = [];
for (let actor of actors) {
    let actorobj = env.dialogueActors[actor];
    lines.push(`    moth`);
    lines.push(
        `        id: ${actor}<br>` +
            `name: ${actorobj.name || "Not defined"}<br/>` +
            `type: ${actorobj.type || "Not defined"}<br/>` +
            `element: ${actorobj.element || "Not defined"}<br/>` +
            `player: ${actorobj.player ? "yes" : "no"}<br/>` +
            `noProcess: ${actorobj.noProcess ? "yes" : "no"}<br/>`
    );
    lines.push(`    ${actor}`);
    lines.push(`        dialogue looks like this`);
}
const allactors = lines.join("\n");

let contributors: string[] = [];

fetch("https://api.github.com/repos/craftxbox/corruskivi/contributors").then((response) => {
    if (response.ok) {
        response.json().then((data) => {
            for (let contributor of data) {
                if (contributor.login === "craftxbox") continue; // Skip self
                contributors.push(`<a class="code" target="_blank" href="${contributor.html_url}">${contributor.login}</a>`);
            }
        })
    } else {
        contributors = ["... I couldn't seem to find them at the moment, sorry!"]
    }
    Object.defineProperty(window, "contributors", {
        value: contributors
    });
})


export function playStartupDialogue() {

    const mothtype = env.dialogueActors.moth.type;

    Object.defineProperty(window, "undoallchanges", {
        value: () => {
            env.dialogueActors.moth.noProcess = true;
            env.dialogueActors.moth.type = mothtype;

            delete env.definitions[`indentation`];
            delete env.definitions[`actor`];
            delete env.definitions[`syntax`];
            delete env.definitions[`noProcess`];
            delete env.definitions[`chain`];
            delete env.definitions[`branch`];
            delete env.definitions[`command`];
            delete env.dialogueActors.craftxbox
            delete window.page.formedDefinitionStrings;
        },
        configurable: true,
        writable: true,
        enumerable: true,
    });

    clearTestPath();

    env.dialogueActors.moth.noProcess = false;
    env.dialogueActors.moth.type += " selectable";

    env.dialogueActors.craftxbox = {
        name: "craftxbox",
        image: "https://crxb.cc/snep.png",
        type: "external moth selectable",
    };

    env.definitions[`indentation`] = `a number of spaces before any text, always in multiples of 4.`;
    env.definitions[`actor`] = `an entity that can speak in a dialogue, defined by its name`;
    env.definitions[
        `syntax`
    ] = `the rules that define how dialogues are written, including indentation, actors, and responses. invalid syntax will cause an error.`;
    env.definitions[`noProcess`] = `a flag that prevents definitions (these boxes) from showing up in the actor's dialogue.`;
    env.definitions[`chain`] = `also referred to as a dialogue, a chain is a grouping of branches that are one coherent dialogue.`;
    env.definitions[`branch`] = `a line with no indentation, defines separate segments of dialogue.`;
    env.definitions[`command`] = `a line with three levels of indentation (twelve spaces). used to denote special actions in the dialogue.`;

    delete window.page.formedDefinitionStrings;

    env.dialogues["editorintropleasedontcollide"] = window.generateDialogueObject(` 
start
    moth
        hey buddy, welcome
            AUTOADVANCE::

    RESPONSES::self
        get me out of here<+>EXEC::window.unpreview()
            SHOWIF::[["ENV!!directFromUrl", true]]
        help<+>helpin
        music<+>vaporintro
            SHOWIF::[["ENV!!directFromUrl", false], ["ENV!!vaporwave", false], ["fbx__editorintropleasedontcollide-vaporwave", false]]
        vaporwave<+>vaporwave
            SHOWIF::[["ENV!!directFromUrl", false], ["ENV!!vaporwave", false], ["fbx__editorintropleasedontcollide-vaporwave", true]]
            HIDEREAD::
        no more music<+>novaporwave
            SHOWIF::[["ENV!!vaporwave", true]]
            HIDEREAD::
        credits<+>credits
        wiki<+>EXEC::window.open('https://github.com/craftxbox/corruskivi/wiki', '_blank');
        back<+>EXEC::window.enterDirectPreview();
            SHOWIF::[["ENV!!directFromUrl", true]]
            FAKEEND::(back)

options
    RESPONSES::self
        get me out of here<+>EXEC::window.unpreview();
            SHOWIF::[["ENV!!directFromUrl", true]]
        help<+>helpin
        music<+>vaporintro
            SHOWIF::[["ENV!!directFromUrl", false], ["ENV!!vaporwave", false], ["fbx__editorintropleasedontcollide-vaporwave", false]]
        vaporwave<+>vaporwave
            SHOWIF::[["ENV!!directFromUrl", false], ["ENV!!vaporwave", false], ["fbx__editorintropleasedontcollide-vaporwave", true]]
            HIDEREAD::
        no more music<+>novaporwave
            SHOWIF::[["ENV!!vaporwave", true]]
            HIDEREAD::
        credits<+>credits
        wiki<+>EXEC::window.open('https://github.com/craftxbox/corruskivi/wiki', '_blank');
        back<+>EXEC::window.enterDirectPreview();
            SHOWIF::[["ENV!!directFromUrl", true]]
            FAKEEND::(back)

helpin
    self
        so how do i use this thing?
    
    moth
        well, what do you want to know?
    
    RESPONSES::self
        basics<+>basics
        syntax<+>syntax
        advanced<+>advanced
        mods<+>mods
        back<+>options
            FAKEEND::(back)

help
    RESPONSES::self
        basics<+>basics
        syntax<+>syntax
        advanced<+>advanced
        mods<+>mods
        back<+>options
            FAKEEND::(back)

basics
    moth
        this is a dialogue editor for the corru.observer dialogue syntax
        it allows you to create, edit, and preview dialogues.
        make memes, write mods, or just have fun with it
        the big box is where you write your dialogue in corru syntax
        press <span class="code">TEST</span> to show the entire dialogue immediately
        or you can press <span class="code">PREVIEW</span to start the dialogue from the beginning
        just like it would look in the game
        you can also press <span class="code">START</span> to show your dialogue as a memory stream

    RESPONSES::self
        ok<+>help
            FAKEEND::(back)

syntax
    RESPONSES::self
        how do i even<+>syntaxbasics
        actors<+>actors
        responses<+>whatresponses
        commands<+>commands
        ok<+>help
            FAKEEND::(back)

syntaxbasics
    self
        how do i even write a dialogue?
    moth
        dialogues are written in a tree like structure.
        each line has indentation that defines its place in the tree.
        lines without any indentation are called branches
        these make up the main structure of the dialogue.
        under any branch, you can type an actor with a single level of indentation.
        that actor will speak the text that follows it.
        like this:<br/><br/><code>start<br/>&nbsp;&nbsp;&nbsp;&nbsp;moth<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hello world</code>
        this makes me say:
        hello world
        each line turns into its own message in the dialogue.
        so if you want to say something like:
        line 1
        line 2
        you can do this:<br/><br/><code>start<br/>&nbsp;&nbsp;&nbsp;&nbsp;moth<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;line 1<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;line 2</code>

    RESPONSES::self
        ok<+>syntax
            FAKEEND::(back)

actors
    moth
        actors are the entities that can speak in a dialogue.
        they are defined by their name and a unique identifier.
        you can use the identifier to refer to them in the dialogue.
        i'm <span class="code">moth</span>, for example.

    RESPONSES::self
        who can i use<+>actorsareyousuresyn
        ok<+>syntax
            FAKEEND::(back)

actorsareyousuresyn
    moth
        hooo boy, there are uh, a LOT.
        if you wanna see a list of them
        you can <a class="code" target="_blank" href="https://github.com/craftxbox/corruskivi/tree/master/src/actors.ts">click on this thing</a>
        or i can list them all for you right now
        but we'll be here for a while

    RESPONSES::self
        i have time<+>allactors
        no thanks<+>syntax
            FAKEEND::(back)

actorsareyousureadv
    moth
        hooo boy, there are uh, a LOT.
        if you wanna see a list of them
        you can <a class="code" target="_blank" href="https://github.com/craftxbox/corruskivi/tree/master/src/actors.ts">click on this thing</a>
        or i can list them all for you right now
        but we'll be here for a while

    RESPONSES::self
        i have time<+>allactors
        no thanks<+>advanced
            FAKEEND::(back)

allactors
    moth
        alright
        here we go
${allactors}
    moth
        and thats all of them.
            EXEC::env.currentDialogue.actors = {}
    RESPONSES::self
        ok<+>syntax
            FAKEEND::(back)

whatresponses
    moth
        responses are the options that the player can choose from.
        you define them like a special kind of actor.
        simply put <span class="code">RESPONSES::</span> then the name of the actor
        like this:<br/><br/><code>&nbsp;&nbsp;&nbsp;&nbsp;RESPONSES::self</code>
        almost always you will want to use the <span class="code">self</span> actor, but you can use other actors too
        then, you define the replies like this:<br/><br/><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name&lt;+&gt;destination</code>
        <span class="code">name</span> is whats shown to the player, and <span class="code">destination</span> is the branch that they will end up in.
        you can also add multiple responses, with a different actor, and they'll show up at the same time, like this:<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;RESPONSES::self<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;yes&lt;+&gt;example<br/>&nbsp;&nbsp;&nbsp;&nbsp;RESPONSES::moth<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;no&lt;+&gt;example
        the responses you're about to see look like this:<br/><br/><code>&nbsp;&nbsp;&nbsp;&nbsp;RESPONSES::self<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fakeend&lt;+&gt;fakeend<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ok&lt;+&gt;syntax<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FAKEEND::(back)</code>
    
    RESPONSES::self
        fakeend<+>fakeend
        ok<+>syntax
            FAKEEND::(back)

fakeend
    self
        what is the "fakeend" thing?
    moth
        <span class="code">FAKEEND::</span> is a command that turns the response into the end buttons you see
        they take a string of text after them, and that's what shows underneath the primary text
        but they act like any old response
        the "ok" button you're about to see is a fakeend button, for example
    
    RESPONSES::self
        ok<+>syntax
            FAKEEND::(back)

commands
    moth
        commands are special lines that start with three levels of indentation (twelve spaces).
        they are used to define special actions in the dialogue.
        for example, you can use <span class="code">AUTOADVANCE::</span to make a dialogue line immediately go to the next line without waiting for the player to click.
    
    RESPONSES::self
        what commands are available<+>commandslist
        ok<+>syntax
            FAKEEND::(back)

commandslist
    moth
        <span class="code">WAIT::</span> waits for an amount of milliseconds before letting the dialogue continue
        <span class="code">AUTOADVANCE::</span> will make the dialogue automatically advance to the next line without waiting for the player to click
        <span class="code">CLASS::</span> will add an HTML class to the dialogue line, which can be used for styling if you're making a mod.
        <span class="code">SHOWONCE::</span> will make the dialogue line or response only show once. once the player has seen it, it won't show up again
        <span class="code">SILENT::</span> will make the line not make any noise (outside of EXEC'ed howls). important if you want to play sounds after an actor transition

        <span class="code">FAKEEND::</span> only works on responses, it makes the response button look like an end button. it takes a string of text after it, which is what shows underneath the primary text
        <span class="code">HIDEREAD::</span> also only works in responses, it'll make it show up rounded with a yellow underline like 'dynamic' responses

        you can find more information about <span class="code">SHOWIF::</span>, <span class="code">NESTIF::</span>, and <span class="code">RESPOBJ::</span> commands in the advanced section of the help menu

        the rest of these commands are normally blocked by your mindspike's safeties, but you can use them if you disable them in the advanced menu
        <span class="code">EXEC::</span> runs whatever javascript code you put after it. also works as a response target.
        <span class="code">THEN::</span> is like EXEC:: but it runs after a WAIT:: instead of immediately
        <span class="code">END::</span> is like EXEC:: but it runs when the dialogue ends.
        <span class="code">SKIP::</span> shows a button to allow skipping some or all of the dialogue, and runs like EXEC:: when pressed.<br><span class="code">SKIPNOTICE::</span> changes the text of the skip button, so you can make it say something else.<br/> <span class="code">SKIPTIME::</span> changes how long the 'skipping dialogue' screen gets shown for, in milliseconds.
        <span class="code">UNREADCHECK::</span> runs javascript to see if a response shows as unread or not

    RESPONSES::self
        ok<+>syntax
            FAKEEND::(back)
mods
    moth
        if you're making a mod, or want to use actors from one, you can load it in just like you would in the game
        just put the URL into the "modification url list" box and save.

    RESPONSES::self
        ok<+>help
            FAKEEND::(back)

advanced
    RESPONSES::self
        definitions<+>definitions
        custom actors<+>customactors
        chains<+>chains
        RESPOBJ<+>respobj
        annotations<+>annotations
        howls<+>howls
        SHOWIF/NESTIF<+>showifnestif
        back<+>help
            FAKEEND::(back)

definitions
    moth
        definitions are how you can underline words in dialogue to add extra information
        like "INHERITED CONTEXT" in the game.
        they're pretty simple, just one replacement per line
        any word, followed by a colon, followed by the definition
        like this:<br/><br/><code>definitions:the thing you're reading right now</code>
        and then whenever i say "<span definition="the thing you're reading right now">definitions</span>", you can now hover over it to see that text.
        these go in the definitions section of the advanced tab, you may have to scroll your editor down to see it.
        a couple actors don't do definitions, notably moth (me), self, sys, and unknown
        you can get around this if you use a custom actor or inline definitions instead but we wont get into that here
    
    RESPONSES::self
        inline definitions<+>inlinedefs
        ok<+>advanced
            FAKEEND::(back)

inlinedefs
    moth
        there is a special way you can make definitions directly in the dialogue without having to put them in the definitions box
        if you only want to use a definition once or twice, or want to define the same word with different definitions in the same dialogue, this is the way to go
        if youve ever used HTML, these are basically just <span> tags:<br/><br/><code>&lt;span definition="testing"&gt;example&lt;/span&gt;</code>
        becomes: <span definition="testing">example</span>

    RESPONSES::self
        ok<+>advanced
            FAKEEND::(back)

customactors
    moth
        custom actors are a bit trickier
        these go in the custom actors section of the advanced tab, you may have to scroll your editor down to see it.
        you need to provide a "<span definition="Javascript Object Notation">JSON</span>" object with all the actors you want to add or override
        i can't explain the ins and outs of json here, but i can show you an example
        <code>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;"craftxbox":{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":"craftxbox",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"image":"https://crxb.cc/snep.png",<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"type":"external moth"<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>}</code>
        if you put this in the custom actors box and save, you can then use "craftxbox" as an actor id
    craftxbox
        and you would get this
    moth
        the <span class="code">type</span> adds classes to the actor's dialogue box, so you can style it differently
        unfortunately i can't show you all the types available but you can see what types existing actors have by looking at the "all actors" section

    RESPONSES::self
        all actors<+>actorsareyousureadv
        ok<+>advanced
            FAKEEND::(back)

chains
    moth
        right, so up until now you've probably been writing dialogues in a single chain
        by default, the editor makes these into the <span class="code">editorpreview</span> chain
        and thats the chain that you see when you preview, or start
        but you can make more than that, which is mostly useful for mods
        by using <span class="code">@name whatever</span> at the <span class="code">start</span> of a dialogue, you define a new chain
        like this:<br/><br/><code>@name whatever<br/>start<br/>&nbsp;&nbsp;&nbsp;&nbsp;moth<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hello world</code>
        and you can switch chains by using <span class="code">CHANGE::whatever</span> as a response destination
        like this: <br/><br/><code>&nbsp;&nbsp;&nbsp;&nbsp;RESPONSES::self<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;change chain&lt;+&gt;CHANGE::whatever</code>
    
    RESPONSES::self
        ok<+>advanced
            FAKEEND::(back)

respobj
    moth
        "RESPOBJ", or response objects are reusable responses that you can define once and use multiple times
        saves having to copy the same responses over and over again, lol
        probably arent going to be super useful to you unless you're making a mod
        you write them just like normal chains but instead of <span class="code">start</span> you use <span class="code">RESPOBJ::</span>
        just put <span class="code">@respobj whatever</span> before the <span class="code">RESPOBJ::</span>
        like this:<br/><br/><code>@respobj whatever<br/>RESPOBJ::<br/>&nbsp;&nbsp;&nbsp;&nbsp;RESPONSES::self<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;example&lt;+&gt;branch</code>
        and then you can use them like in a branch this:<br/><br/><code>branch<br/>&nbsp;&nbsp;&nbsp;&nbsp;RESPOBJ::whatever</code>
        they work just like chains though, so make sure the only thing after them is a chain or another respobj
        or anything else will disappear and it'll be confusing
    
    RESPONSES::self
        ok<+>advanced
            FAKEEND::(back)

annotations
    moth
        annotations are a special comment that you can put in your dialogue
        these diverge from syntax a bit but they're easy to remove if needed
        they start with <span class="code">@</span> and have no indentation
        you can use them to add notes to your dialogue, but they have a more important use
        certain annotations will change how the dialogue is processed
        like <span class="code">@testpath</span> which tells the editor which responses to click on when testing
        or <span class="code">@background</span> changes what background is used

    RESPONSES::self
        testpath<+>testpath
        background<+>background
        css<+>css
        initial-text/actor<+>initialtext
        ok<+>advanced
            FAKEEND::(back)

annotationslist
    RESPONSES::self
        testpath<+>testpath
        background<+>background
        css<+>css
        initial-text/actor<+>initialtext
        ok<+>advanced
            FAKEEND::(back)

testpath
    moth
        normally when you test a chain only the first branch is shown
        but you can use <span class="code">@testpath</span> to define a path that will be shown instead
        each pair of numbers after <span class="code">@testpath</span> tells the editor which response to click on
        so if you put <span class="code">@testpath 0,1</span>
        it will click the second reply of the first response menu.
        the numbers start from zero so 0 is the first, 1 is the second, etc
        if you only have one response actor, you will always want to use <span class="code">0</span> as the first number
        but if you had for example:<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;RESPONSES::self<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;yes&lt;+&gt;example<br/>&nbsp;&nbsp;&nbsp;&nbsp;RESPONSES::moth<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;no&lt;+&gt;example
        and you wanted to click "no", you would use <span class="code">@testpath 1,0</span>
        you can put as many pairs of numbers as you want, and it will click them in order
        like this: <span class="code">@testpath 0,1 1,0 0,2 2,2</span>
        but note you can only have one testpath, and it must be at the very top of your editor
        otherwise it will break everything
    RESPONSES::self
        ok<+>annotationslist
            FAKEEND::(back)

background
    moth
        so normally the editor uses no background
        all you get is a black void
        but if you want to spice it up a little, you can use the <span class="code">@background</span> annotation
        it takes a single argument, which is a link to an image
        like this: <span class="code">@background https://corru.observer/img/textures/ccontours.gif</span>
        and then the editor will use that image as the background
        there's also <span class="code">@foreground</span> which works the same way but it will display on top of the background
        useful for adding a 'mask' to the background
        typically this would be <span class="code">@foreground https://corru.observer/img/textures/fadeinlonghalf.gif</span>
        but you can pick whatever you want
        go wild
        they apply to each chain individiually so you can have different backgrounds for different parts of your dialogue
    RESPONSES::self
        background-behaviour<+>bgpreload
        ok<+>annotationslist
            FAKEEND::(back)

bgpreload
    moth
        so in earlier versions of the editor, background/foreground images weren't loaded until your spike saw them for the first time
        which would cause the background to load slowly from the top down
        now, by default, theyre preloaded when the dialogue starts so they show up instantly
        but if you want to go back to the old way, you can use <span class="code">@background-behaviour lazy</span>
        and then the images will only load when theyre first seen
        it affects the whole dialogue though, not just a single chain
    RESPONSES::self
        ok<+>annotationslist
            FAKEEND::(back)

initialtext
____NESTIF::[["fbx__editorintropleasedontcollide-initialtext", false]]
    self
        when i go to write an annotation the editor suggest two annotations you didn't mention
            EXEC::change("illegalEditor", "++");
        @initial-text and @initial-actor
        what are those?
    moth
        TEXEC::window.silly.getMothLine("illegalEditor", 1);
        TEXEC::window.silly.getMothLine("illegalEditor", 2);
        TEXEC::window.silly.getMothLine("illegalEditor", 3);
        TEXEC::window.silly.getMothLine("illegalEditor", 4);
    moth
        anyways, let me find the docs
        ...
____END
    moth
        ok, so you know when you start a memory stream, your mindspike shows "memory stream located", right?
        it's a safety that your mindspike puts in to make sure everything is synchronized before you go in
        turns out, there's an exploit out there that lets you change that to whatever you want
        so <span class="code">@initial-text</span> changes that text to whatever you put after it
        and <span class="code">@initial-actor</span> changes the actor it shows up as
    
    RESPONSES::self
        ok<+>annotationslist
            FAKEEND::(back)

howls
    moth
        what are you a wolf or something?
        kidding
        howls are a way to play sounds in the dialogue
        they're the only kind of <span class="code">EXEC::</span> command that you can use without disabling your mindspike's safeties
        you can use them like this:<br/><br/><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;EXEC::play("muiScanner", 0.5, 1)</code>
        the first argument is the sound name, the second is the rate, and the third is the volume.
        that one sounds like this
            EXEC::play("muiScanner", 0.5, 1)
        'rate' is a relative number of how fast and high pitched a sound plays
        so like, 0.5 will be half speed and half pitch
        and 2 will be double speed and double pitch
        obviously 1 would be normal
        note, theres a bug in the latest mindspike firmware that makes howls not play on an actor transition
        if you want to play a howl right after changing actors, you need to add the <span class="code">SILENT::</span> command to the line
        
    RESPONSES::self
        what can i use<+>howlslist
        custom howls<+>customhowls
        ok<+>advanced
            FAKEEND::(back)

css
    moth
        i cant really explain how css and stylesheets work here
        but you can use the <span class="code">@css</span> annotation to add custom css to your dialogue
        just put <span class="code">@css</span> followed by the selector, and the styles you want to apply
        like this:<br/><br/><code>@css .moth {<br/>&nbsp;&nbsp;&nbsp;&nbsp;background-color: red;<br/>}</code>
        and that would make all elements with the <span class="code">moth</span> class have a red background
        you can use any valid css here, so go nuts
        but be careful not to make your mindspike menu invisible or anything

    RESPONSES::self
        ok<+>annotationslist
            FAKEEND::(back)

howlslist
    moth
        you'll have to try them out yourself to see what they sound like
        but here's a list of every howl i know of
        ${Object.keys((window.sfxmap as any)._sprite).map((sfx) => `<span class="code">${sfx}</span>`).join(", ")}
        all the ones with numbers are 'variants'
        so if you give <span class="code">play("talksignal")</span> for example
        it will play a random variant of the talksignal sound
        or you could put the number in there too if you only wanted the one.
    RESPONSES::self
        custom howls<+>customhowls
        ok<+>advanced
            FAKEEND::(back)

customhowls
    moth
        alright, so, custom howls
        they're pretty complicated, but i think i can simplify them enough
    self
        what if i don't want simple
    moth
        well, you're going to have to live with that feeling
        i don't actually know how these work under the hood lol
        anyway, custom howls
        let's take a look at this example real quick:
        <code>example = new Howl({<br/>&nbsp;&nbsp;src: ["https://corru.observer/audio/ozoloop.ogg"],<br/>&nbsp;&nbsp;rate: 2,<br/>&nbsp;&nbsp;volume: 0.5,<br/>&nbsp;&nbsp;loop: true<br/>});</code>
        "example" is the name, the audio source (src) is straight from corru.observer...
        "rate" refers to the rate at which its played, which means both the pitch and the speed
        volume is pretty straightforward, referring to the volume
        and loop just says if it loops or not
        you use <br/><br/><code>EXEC::example.play()</code> to play it, and <br/><br/><code>EXEC::example.stop()</code> to stop it
        you can also have multiple howls playing at once
        so, if you put in, say, <br/><br/><code>EXEC::example.play();example500.play()</code><br/><br/> you'll play both "example" and our made-up howl "example 500"
        trying to run them seperately just sort of doesn't work
        you might have noticed that the custom howl command is way simpler than the normal howl command
        that's in part because the regular howls are doing a lot of the heavy lifting for you
        if you want to change the rate, or volume, you'd normally just change them in your play()
        but for a custom howl, you'll need to do each action manually, like <br/><br/><code>EXEC::example.rate(0.5); example.play();</code>
        though on the upside you get way more options than just rate and volume
        you can use play, pause, stop, mute, volume, fade, rate, seek, loop, load, unload, and a special action called ratween
        we definitely don't have the time to explain all those here though
        you don't need to use the <span class="code">SILENT::</span> command on actor transitions with custom howls, they work fine without it
        but it might still play the actor voice sound unless you use SILENT::
        if anything here seems too confusing, or your entire corruskivi breaks, go ask <span class="code">@craftxbox</span> or any other user on the <a class="code" target="_blank" href="https://discord.gg/qwKhJMan8H">discord</a> for help
        we don't bite lol
        got all that?
    self
        no
    moth
        great, because we're not done yet
        there's also "sprite"
        not to mention all the actions
    RESPONSES::self
        sprite<+>sprite
        actions<+>howlactions
        enough<+>advanced
            FAKEEND::(back)

howlactions
    moth
        alright, actions. there's a lot of those, so bare with me lol
        so when you have your example.play(), the action here is the "play" part. between the ()'s is the "arguments"
        play is pretty simple. it plays your custom howl
        you can optionally give it an argument for a specific sprite but we wont get into that here
        but you also have <span class=code>pause</span> and <span class=code>stop</span>
        <code>EXEC::example.pause()</code> will pause your howl right where it is. just play() it again and it'll start where it left off
        <code>EXEC::example.stop()</code> will obviously stop it entirely. play will start from the beginning when you next use it.
        <span class=code>rate</span> and <span class=code>volume</span> are here in the same way as you'd be familiar with regular howls
        <code>EXEC::example.rate(0.5)</code> makes your howl play at half speed
        <code>EXEC::example.volume(0.5)</code> makes it play at half volume
        <span class=code>fade</span> gets funky with it.<br/><code>EXEC::example.fade(1,0.5,1000)</code> will fade the volume from 100%, to 50%, over 1000 milliseconds, aka one second
        <code>EXEC::example.seek(1000)</code> will jump straight to the 1 second mark of the howl, immediately if its already playing, or whenever you next play()
        <code>EXEC::example.mute(true)</code> is pretty self explanatory. it mutes your howl, but keeps playing in the background. change its value from true to false to unmute.
        <span class=code>load</span> and <span class=code>unload</span> also exist but they're not really useful to use in a dialogue so i wont bother explaining them
        you also get a special action called <span class=code>ratween</span> that's invoked a little different than the others
        <code>EXEC::ratween(example, 0.5, 1000)</code><br/><br/>is kinda like fade, but between one howl and itself. it'll slowly change your howl's rate to 0.5 over the span of 1000 milliseconds
        special to note here that you do have to put "example" in as an argument here, instead of up front like the rest of the actions.
        uh, not with the airquotes, though. unlike some other actions, ratween doesn't want those anywhere.
        so, while <code>example.play("sprite")</code><br/><br/> is fine, <code>ratween("example")</code><br/><br/>wouldn't be 
        
    RESPONSES::self
        sprite<+>sprite
        changebgm<+>changebgm
        thanks<+>advanced
            FAKEEND::(back)

changebgm
____NESTIF::[["fbx__editorintropleasedontcollide-changebgm", false]]
    self
        my editor shows me a couple of special actions you didnt mention
            EXEC::change("illegalEditor", "++");
        changeBgm and revertBgm
        what are those?
    moth
        TEXEC::window.silly.getMothLine("illegalEditor", 1);
        TEXEC::window.silly.getMothLine("illegalEditor", 2);
        TEXEC::window.silly.getMothLine("illegalEditor", 3);
        TEXEC::window.silly.getMothLine("illegalEditor", 4);
    moth
        anyways, let me find the docs
        ...
        yep, okay
____END
        changeBgm is like ratween, it takes your howl as an argument, instead of as a prefix
        but its like. EXTRA crazy for configuration
        instead of taking rate/etc as extra arguments, it instead wants a JavaScript Object
        dont be too intimidated, or do be, up to you. either way, its kinda similar to how you write custom actors
        <code>EXEC::changeBgm(example, {length: 1000, preserve: true, rate: false, seek: false, pause: false})</code><br/><br/> is how you invoke it. 
        it sets your howl into the mindspike's background music, which as im sure you're aware isn't something a thoughtstream is supposed to be able to do
        you could omit the entire {} section and the comma if you JUST want to set background music but the options are pretty powerful too
        changeBgm does a crossfade between whatever bgm was playing before, into your new bgm. ie: the old music fades out, and the new one fades in at the same time.
        length controls how long that crossfade takes. by default it'll be 1000ms, aka 1 second
        preserve determines if you want to save the old bgm track or not. this is useful for revertBgm which we'll get into later
        rate is as you'd expect, give it a decimal number and it will change the rate.
        seek is also like normal. give it an integer number and it'll "seek" there, in milliseconds
        pause only affects the old bgm, if you set it to true instead of false, it will pause the old bgm instead of stopping it outright. so revertBgm will resume instead of restart
        now here's the crazier bit: if you dont want to set any specific value, say rate, or seek, you want to remove them entirely from the {} block
        so example, you want a three second crossfade and the new music at 2x speed:<br/><br/>EXEC::changeBgm(example, {length: 3000, rate: 2})<br/><br/>thats all you need. you don't include the preserve, seek, or pause bits at all.
        thankfully, revertBgm is way easier. it switches back to the old music you had playing (so long as you preserve:true'd it)
        it takes a single argument, the crossfade length. so:<br/><br/>EXEC::revertBgm(1000)</br></br> will fade back to the music you played before over one second.
        note that if you haven't done changeBgm more than once, you probably wont be able to revert to anything!
        mainly since there might be nothing to revert back to lol
        just remember to preserve your howls when you want them
        it also says here you can address <span class=code>env.bgm</span> and <span class=code>env.oldBgm</span> as if they were howl names (like <span class=code>example</span> from earlier), so you can run actions on the music without necessarily knowing which howl's actually in play
        all in all this stuff is super complicated and im not entirely sure im explaining it right either so as usual ask the <a class="code" target="_blank" href="https://discord.gg/qwKhJMan8H">discord</a> peeps about it if you're confused
    RESPONSES::self
        sprite<+>sprite
        i'll figure it out<+>advanced
            FAKEEND::(back)

sprite
    moth
        glad you asked
        "sprite" is the property that's used to indicate when and where a howl starts and stops
        for example, you would use <br/><br/>sprite: {<br/>__default: [50, 100, true]<br/>}<br/><br/> to indicate that the howl you're playing starts 50 miliseconds in to the audio, then keeps going for another 100 miliseconds
        the "true" just means it loops btw. change it to false and it'll one-shot instead.
        <span class="code">__default</span> is what will play when you example.play()
        but you can add more than just __default:<br/><br/>sprite: {<br/>dingus: [2000, 1000, false]<br/>}<br/><br/>and then you can use example.play("dingus") to play just that small segment instead of the whole thing. 
        sprite is probably the scariest part of making a custom howl, even if it should really be the easiest
        it's pretty much just counting how many seconds are in your audio, then converting it to miliseconds
        obviously though it's not required for your howl to work, it's just useful
        keep in mind, sprite ignores if your audio is slowed down, sped up, whatever, so you only need to count the seconds for the original audio source
        pretty convenient, right?
    self
        sure
        how do i make my custom actor use different talk sounds each time
    moth
        if ever you figure out how to reverse engineer that whole thing, let me know
        <span definition="this is as of yet unsupported by corruskivi and there is no way to do custom sounds with randomization">i have no idea lol</span>
    RESPONSES::self
        actions<+>howlactions
        ok<+>advanced
            FAKEEND::(back)

showifnestif
    moth
        <span class="code">SHOWIF::</span> is a standard command that lets you show a dialogue line or response only if a certain condition is met
        usually this would be if the player has seen an entity or dialogue or whatever before.
        as an example:<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code">SHOWIF::[["whatever"], ["example", "testing"]]</span>
        this will only show if the 'whatever' flag is anything but false, and the 'example' flag is specifically only "testing"
        typically you would use these for seeing if a branch has been seen before
        the way you do that is by using <span class="code">fbx__chainname-branchname</span> as the key.
        the default chain is <span class="code">editorpreview</span>, so if you wanted to see if the player has seen the 'start' branch of that chain, you would use <span class="code">fbx__editorpreview-start</span>
        but since its shared you might want to use a custom chain to avoid conflicts
        internally, showif calls the check() function, so there are a lot of flags you can check for
        unfortunately i don't have the time to explain them all here
        anyway, SHOWIF:: can also be used as a special 'root command' instead of on a single dialogue line
        instead of giving it three levels of indentation, you give it zero levels and instead add four underscores before it
        like this:<br/><br/><code>____SHOWIF::[["whatever"], ["example", "testing"]]</code>
        then, it will apply to everything past it, until you add a <span class="code">____END</span> or another <span class="code">____SHOWIF::</span>
        this can be helpful to avoid repeating the same SHOWIF:: command over and over again
        <span class="code">NESTIF::</span> is a similar command, but you can put multiple of them inside each other
        each of them will go up until the next ____END 
        important note! if you name your branches with caps in them, you need to pass them as lowercase to the SHOWIF:: command
        so if you have a branch called "Test1", you need to use <span class="code">["test1"]</span> in the SHOWIF:: command
        similarly, if you use spaces in branch names (i am judging you), you need to replace them with underscores
        heres an example of everything, i wasn't sure how best to demonstrate it: <br/><br/>start<br/>&nbsp;&nbsp;&nbsp;&nbsp;moth<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;always seen<br/>____SHOWIF::[["test1"]]<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;only if test1<br/>____END<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;always seen<br/>____NESTIF::[["test2"]]<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;only if test2<br/>____NESTIF::[["test3"]]<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;only if test3 and test2<br/>____END<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;only if test2<br/>____END<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;always seen

    RESPONSES::self
        ok<+>advanced
            FAKEEND::(back)

credits
    self
        who made this?
    moth
        oh, uh, obviously this isnt an official thing, corruworks didn't make this and probably hasn't even seen it.
        so don't bug them about it, or take anything here as official canon.
    
    craftxbox
        My name is craftxbox, I made this dialogue editor (and the tutorial dialogue you're reading right now).
        I hope you find it useful, and if you have any questions, feel free to ask me on the <a class="code" target="_blank" href="https://discord.gg/qwKhJMan8H">discord</a>.
        You can find the full source code for it here:<br/><a class="code" target="_blank" href="https://github.com/craftxbox/corruskivi">https://github.com/craftxbox/corruskivi</a>
        I credit @ifritdiezel for their original dialogue editor, aswell as @noobogonis and @the_dem for the dialogue toolkit I used as a reference
        Obviously, @corruworks made the game itself, and all the visuals you see here. I'm only responsible for the editor itself.
        I would also like to credit @daisy_m766 for giving me the idea to make this editor in the first place.
        As well, I would like to credit all of the people who have contributed to the git repository:
        TEXEC::contributors.join(", ")

    RESPONSES::self
        ok<+>options
            FAKEEND::(back)

vaporintro
    self
        its too quiet
        do you have any music?
    moth
        oh uh, sure
        you ever heard of vaporwave?
    RESPONSES::self
        yes<+>vaporwave
        no<+>vaporno

vaporno
    self
        no
    moth
        you wanna give it a try anyway?
    RESPONSES::self
        sure<+>vaporwave
        no thanks<+>options
            FAKEEND::(back)

vaporwave
    moth
        alright
        just gimme a sec
    sourceless
        BEYOND THE MINDSPIKE, YOU HEAR THE SHUFFLING OF FOOTSTEPS AGAINST THE CONCRETE
            EXEC::window.silly.vapor.init()
            WAIT::5000
            AUTOADVANCE::
        A CLICK IS HEARD, NOT UNLIKE THAT OF AN OLD 2010's CASSETTE PLAYER
    moth
        here we go
            EXEC::window.silly.vapor.play()
    RESPONSES::self
        nevermind<+>novaporwave
        thanks<+>options
            FAKEEND::(back)

novaporwave
____SHOWIF::[["ENV!!directFromUrl", false]]
    self
        ACTUALLY, NEVERMIND ON THE MUSIC
    moth
        oh, ok
____END
____SHOWIF::[["ENV!!directFromUrl", true]]
    self
        THE MUSIC IS A BIT DISTRACTING
    moth
        shit, sorry
____END
    sourceless
        THE CLICK OF THE CASSETTE PLAYER IS HEARD AGAIN, FOLLOWED BY SILENCE.
            EXEC::window.silly.vapor.stop()
    RESPONSES::self
        thanks<+>options
            FAKEEND::(back)
`);

    previewEntireDialogue(`editorintropleasedontcollide`, { specificChain: "start" });
    env.currentDialogue.actors = {};
}

Object.defineProperty(window, "playStartupDialogue", {
    value: playStartupDialogue,
});
