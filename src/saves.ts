import { getCustomActorsContent, setCustomActorsContent, updateActors } from "./customactors";
import { getDefinesContent, setDefinesContent, updateDefines } from "./defines";
import { getHowlsContent, setHowlsContent, updateHowls } from "./howl";
import { generateEditorDialogue, previewEntireDialogue } from "./main";
import { getEditorContent, setEditorContent } from "./monaco";

const saveEditorSlot = document.querySelector("#save-editor-slot") as HTMLSelectElement;

function getExistingSaves(): string[] {
    return Object.keys(localStorage).filter((key) => key.startsWith("save_") || key.startsWith("___autosave"));
}

if (getExistingSaves().length === 0) {
    const defaultSave = `start
    moth
        this is an example dialogue
        you can make a character speak
        one line at a time
    
    RESPONSES::self
        who are you talking to<+>who
        ok<+>END
who
    self
        who are you talking to?
    moth
        uh, nobody
        don't worry about it

    RESPONSES::self
        ok<+>END
`;
    localStorage.setItem(
        "save_0",
        JSON.stringify({
            name: "Default Save",
            date: new Date().toISOString(),
            dialogue: defaultSave,
            actors: "",
            defines: "",
            howls: ""
        })
    );
    loadSlot("save_0", true);
    console.warn("No existing saves found. Created a default save slot.");
}

refreshSaveMenu();

if (saveEditorSlot?.value === "___NEW_SLOT") {
    document.querySelector("#save-editor-name")!.removeAttribute("hidden");
}

saveEditorSlot.addEventListener("change", () => {
    const value = saveEditorSlot.value;
    if (value === "___NEW_SLOT") {
        document.querySelector("#save-editor-name")!.removeAttribute("hidden");
    } else {
        document.querySelector("#save-editor-name")!.setAttribute("hidden", "true");
    }
});

document.querySelector("#load-editor-save")?.addEventListener("click", () => {
    const slot = saveEditorSlot.value;
    if (slot === "___NEW_SLOT") {
        window.chatter({ actor: "funfriend", text: "What is this? There's nothing here!", readout: true });
        window.play("talk", 2);
        console.warn("Attempted to load the new save slot, which is not valid.");
        return;
    }

    loadSlot(slot);
});

document.querySelector("#save-editor-save")?.addEventListener("click", () => {
    const slot = saveEditorSlot.value;
    if (slot === "___NEW_SLOT") {
        const nameInput = document.querySelector("#save-editor-name") as HTMLInputElement;
        if (!nameInput.value.trim()) {
            window.chatter({ actor: "funfriend", text: "You need to give your save a name!", readout: true });
            window.play("talk", 2);
            return;
        }
        saveSlot(slot, nameInput.value.trim());
    } else {
        const nameInput = document.querySelector(`option[value="${slot}"]`) as HTMLInputElement;
        if (!nameInput) {
            window.chatter({ actor: "funfriend", text: "That save slot does not exist!", readout: true });
            window.play("talk", 2);
            console.error("Attempted to save to a non-existent slot:", slot);
            return;
        }
        saveSlot(slot, nameInput.innerText.trim());
    }
});

document.querySelector("#delete-editor-save")?.addEventListener("click", () => {
    const slot = saveEditorSlot.value;
    if (slot === "___NEW_SLOT") {
        window.chatter({ actor: "funfriend", text: "I cannot delete that, there's nothing there!", readout: true });
        window.play("talk", 2);
        return;
    }

    let deleteHandler = () => {
        deleteSlot(slot);
        document.getElementById("delete-warning")?.style.setProperty("display", "none");
    };

    let cancelHandler = () => {
        document.getElementById("delete-confirm")?.removeEventListener("click", deleteHandler);
        document.getElementById("delete-warning")?.style.setProperty("display", "none");
    };

    document.getElementById("delete-warning")?.style.removeProperty("display");
    document.getElementById("delete-confirm")?.addEventListener("click", deleteHandler, { once: true });

    document.getElementById("delete-cancel")?.addEventListener("click", cancelHandler, { once: true });
});

export function saveSlot(slot: string, name: string) {
    const saveData = {
        name: name,
        date: new Date().toISOString(),
        dialogue: getEditorContent(),
        actors: getCustomActorsContent(),
        defines: getDefinesContent(),
        howls: getHowlsContent()
    };

    let saveKey = slot;

    const saveString = JSON.stringify(saveData);

    if (slot === "___NEW_SLOT") {
        let saveNumber = getExistingSaves().length;
        while (getExistingSaves().includes(`save_${saveNumber}`)) {
            saveNumber++;
        }

        saveKey = `save_${saveNumber}`;
    } else {
        let originalData = localStorage.getItem(slot);
        
        if (originalData) {
            let autosave = fetchAutosaveSlot("Overwriting Save: " + name)
            let originalObj = JSON.parse(originalData);
            originalObj.name = autosave.name;

            localStorage.setItem(autosave.slot, JSON.stringify(originalObj));
        }
    }

    localStorage.setItem(saveKey, saveString);

    window.chatter({ actor: "funfriend", text: `Save "${name}" created successfully!`, readout: true });
    window.play("talk", 2);
    localStorage.setItem("lastSave", saveKey);
    refreshSaveMenu();
}

export function loadSlot(slot: string, suppressPreview?: boolean) {
    let autosave = fetchAutosaveSlot("Before Load")

    saveSlot(autosave.slot, autosave.name);
    refreshSaveMenu();

    const saveData = localStorage.getItem(slot);
    if (!saveData) {
        console.error("Attempted to load a non-existent slot:", slot);
        return;
    }

    const parsedData = JSON.parse(saveData);

    setEditorContent(parsedData.dialogue || "");
    setCustomActorsContent(parsedData.actors || "");
    setDefinesContent(parsedData.defines || "");
    setHowlsContent(parsedData.howls || "");

    updateActors();
    updateDefines();
    updateHowls();

    document.querySelector("#save-editor-name")!.setAttribute("hidden", "true");
    saveEditorSlot.value = slot;

    window.chatter({ actor: "funfriend", text: `Loaded save "${parsedData.name}" successfully!`, readout: true });
    window.play("talk", 2);
    if (!suppressPreview) {
        generateEditorDialogue();
        previewEntireDialogue("editorpreview");
    }
}

export function deleteSlot(slot: string) {
    const save = localStorage.getItem(slot) || "";
    const friendlyName = JSON.parse(save)?.name || `Save Slot ${slot.replace("save_", "")}`;
    localStorage.removeItem(slot);
    const option = saveEditorSlot.querySelector(`option[value="${slot}"]`);
    if (option) {
        saveEditorSlot.removeChild(option);
    }

    window.chatter({ actor: "funfriend", text: `Save "${friendlyName}" deleted successfully!`, readout: true });
    window.play("talk", 2);
}

function fetchAutosaveSlot(reason: string): { slot: string; name: string } {
    const autosaveSlots = {
        "___autosave-1": localStorage.getItem("___autosave-1"),
        "___autosave-2": localStorage.getItem("___autosave-2"),
        "___autosave-3": localStorage.getItem("___autosave-3")
    }

    let oldestSave = "___autosave-1";
    let oldestDate = new Date(8640000000000000); // max date

    for (const [slot, data] of Object.entries(autosaveSlots)) {
        if (data) {
            const parsedData = JSON.parse(data);
            const saveDate = new Date(parsedData.date);
            if (saveDate < oldestDate) {
                oldestDate = saveDate;
                oldestSave = slot;
            }
        } else {
            return { slot: slot, name: `Ephemeral ${slot.slice(-1)}: ${reason}` };
        }
    }

    return { slot: oldestSave, name: `Ephemeral ${oldestSave.slice(-1)}: ${reason}` };
}

function refreshSaveMenu() {
    let selectedSlot = saveEditorSlot.value;
    saveEditorSlot.innerHTML = `<option value="___NEW_SLOT">CREATE NEW SLOT</option>`;
    for (const save of getExistingSaves()) {
        const saveData = localStorage.getItem(save);
        if (!saveData) {
            console.warn(`Save slot ${save} is empty or does not exist.`);
            continue;
        }
        const saveObj = JSON.parse(saveData);
        const option = document.createElement("option");
        option.value = save;
        option.innerText = saveObj.name || `Save Slot ${save.replace("save_", "")}`;
        saveEditorSlot.insertAdjacentElement("afterbegin", option);
        saveEditorSlot.value = save; // Set the first option as the default selected slot
    }
    if(selectedSlot && getExistingSaves().includes(selectedSlot))
        saveEditorSlot.value = selectedSlot;
}
