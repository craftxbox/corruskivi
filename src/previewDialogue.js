// copied almost verbatim from the game
// no license is asserted over this file.
const dialogueBox = document.querySelector("#dialogue-box");

// Pretty much the same function from dialogue.js but gutted for programatic use.
export function previewDialogue(dialogue, i = 0) {

    try {
        let queue = dialogue.body;
        var dMenu = document.getElementById("dialogue-menu"); //this is redefined later

        if (i < queue.length) {
            if (shouldItShow(queue[i])) {
                let current = queue[i];
                let currentActor = getDialogueActor(current.actor);

                //the current dialogue bubble doesn't have text - therefore it has a texec (text exec) to generate the response
                if (typeof current.texec == "function") {
                    current.text = current.texec();
                }

                //log the dialogue in the readout too
                if (current.actor != "unknown")
                    readoutAdd({
                        message: current.text,
                        image: currentActor.image,
                        name: current.actor,
                        displayName: currentActor.name,
                        type: currentActor.type,
                        sfx: false,
                        actor: current.actor,
                    });

                //execute any code attached to the message
                if (current.exec) {
                    current.exec();
                }

                //hide the portrait if it's the last person who talked, otherwise add one
                var portrait = "";
                if (current.actor != env.currentDialogue.prevSpeaker && currentActor.image)
                    portrait += `<div class="dialogue-portrait" style="--background-image: url(${currentActor.image});"></div>`;
                env.currentDialogue.prevSpeaker = current.actor;

                //create the dialogue message block
                let newLine = `
                    <div class="dialogue-message actor-${current.actor.replace("::", " expression__")} ${currentActor.player ? "from-player" : ""} ${
                    currentActor.type
                } ${current.class || ""}">
                        ${portrait}
                        <div class="dialogue-text">
                            ${currentActor.noProcess ? current.text : processDefinitionsInString(current.text)}
                        </div>
                    </div>
                    `;
                dialogueBox.insertAdjacentHTML("beforeend", newLine);
                document.querySelector(".dialogue-message:last-of-type")?.classList.add("sent");
            } else {
                //sendDialogue(dialogue, i + 1);
                //this caused hilarious issues where if a dialogue was skipped, it would show the next showable dialogue repeatedly instead
            }
        } else {
            //the dialogue chain is over, show responses
            env.currentDialogue.prevSpeaker = "nobody stupid";
            env.currentDialogue.justChanged = false;
            dialogueBox.insertAdjacentHTML("beforeend", `<div id="dialogue-menu"></div>`);

            dMenu = document.getElementById("dialogue-menu"); //there's a new dialogue menu--the old one is now inactive

            dialogue.responses?.forEach((actor) => {
                let actorObj = getDialogueActor(actor.name, true);
                dMenu?.insertAdjacentHTML(
                    "beforeend",
                    `
                    <div class="dialogue-actor ${actorObj.type} dialogue-options-${actor.name} actor-${actor.name}">
                        <div class="dialogue-portrait" style="--background-image: url(${actorObj.image})"></div>
                        <div class="dialogue-options"></div>                    
                    </div>
                `
                );

                actor.replies.forEach((reply) => {
                    console.log(`SHOULD REPLY ${reply.name} SHOW? ::: ${shouldItShow(reply)}`);
                    let show = shouldItShow(reply);

                    if (show) {
                        console.log(`determined ${show}, so showing reply`);

                        //programmatically decide the reply name that shows if the reply name is a function
                        let nameToUse;
                        if (typeof reply.name == "function")
                            nameToUse = reply.name(); // this case is an ancient holdover from before the dialogue string syntax
                        else if (reply.texec) nameToUse = reply.texec();
                        else nameToUse = reply.name.trim();

                        //determine what kind of unread it is, if any
                        let readState;
                        if (typeof reply.unreadCheck == "function") readState = reply.unreadCheck();
                        else readState = checkUnread(reply);

                        if (readState == false) readState = "read";
                        var readAttribute = reply.hideRead ? 'read="hidden"' : `read=${readState}`;

                        //detect if it's an end reply, and if it should have custom 'tiny' text
                        var isEnd;
                        if (reply.fakeEnd || reply.destination == "END") isEnd = reply.fakeEnd || processStringTranslation("(end chat)");

                        //detect what definition to show
                        var tooltip;
                        if (!isEnd) {
                            tooltip = "NOTE::";
                            if (!reply.hideRead) {
                                if (reply.class) {
                                    switch (readState) {
                                        case "read":
                                            tooltip += `'has no unutilized responses'`;
                                            break;

                                        case "unread":
                                        case "within":
                                            tooltip += `'has unutilized responses'`;
                                    }
                                } else {
                                    switch (readState) {
                                        case "read":
                                            tooltip += `'previously utilized response'`;
                                            break;

                                        case "unread":
                                            tooltip += `'response not yet utilized'`;
                                            break;

                                        case "within":
                                            tooltip += `'response leads to unused responses'`;
                                    }
                                }
                            } else {
                                tooltip += `'dynamic response'`;
                            }
                        }

                        if (reply.definition) tooltip = reply.definition;

                        //add the reply and set up its click handler
                        document.querySelector(`#dialogue-menu .dialogue-options-${actor.name} .dialogue-options`)?.insertAdjacentHTML(
                            "beforeend",
                            `
                            <span
                                class="
                                    reply
                                    ${isEnd ? "end-reply" : ""}
                                    ${reply.class || ""}
                                "
                                reply="${reply.destination}" 
                                name="${nameToUse}"
                                ${tooltip ? `definition="${tooltip}"` : ""}
                                ${!isEnd ? readAttribute : ""} 
                                ${isEnd ? `endtext="${isEnd}"` : ""}
                            >${nameToUse}</span>`
                        );

                        //on option click, remove event listeners and add classes to indicate choice
                        document.querySelector(`#dialogue-menu .dialogue-options span[name="${nameToUse}"]`)?.addEventListener("mousedown", function (e) {
                            console.log(nameToUse);

                            if (reply.exec) {
                                try {
                                    reply.exec();
                                } catch (e) {
                                    printError(e);
                                    console.log(e);
                                }
                            }

                            var dest = reply.destination;
                            //redefine dest as something more readable if it's a function
                            if (dest.includes("EXEC::")) {
                                dest = `EX-${slugify(nameToUse.slice(0, 10))}`;
                            }

                            document.querySelectorAll("#dialogue-menu .dialogue-options span").forEach((el) => (el.innerHTML += "")); //destroys event listeners in one easy step
                            this.classList.add("chosen");
                            this.closest(".dialogue-actor").classList.add("chosen");

                            //determine how to handle the reply based on any special prefixes or names
                            let replyValue = this.attributes.reply.value;
                            if (replyValue == "END") {
                                //end of dialogue
                                endDialogue(env.currentDialogue.chain.end);
                            } else if (replyValue.includes("CHANGE::")) {
                                //changing to different dialogue
                                let changeValue = replyValue.replace("CHANGE::", "");
                                changeDialogue(changeValue);
                            } else if (replyValue.includes("EXEC::")) {
                                //executing a function - the function given should end dialogue or change it, otherwise may softlock
                                Function(`${replyValue.replace("EXEC::", "")}`)();
                                clearDialogueMenu();
                            } else {
                                sendDialogue(env.currentDialogue.chain[replyValue]);
                            }
                        });
                    }
                });
            });

            document.querySelectorAll(`#dialogue-menu .dialogue-options span`).forEach((e) => {
                e.addEventListener("mouseenter", () => play("muiHover"));
                e.addEventListener("click", () => play("muiClick"));
            });

            //show only if the actor has any valid/choosable options
            setTimeout(() => {
                document.querySelectorAll("#dialogue-menu .dialogue-actor").forEach((e) => {
                    if (e.querySelector(".dialogue-options")?.childElementCount) e.classList.add("sent");
                    else e.remove();
                });
            }, 50);
        }

        dBox.scrollTop = dBox.scrollHeight;
    } catch (e) {
        printError(e);
        if (!check("TEMP!!debug")) endDialogue();
    }
}

export default previewDialogue;