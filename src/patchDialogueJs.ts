import { applyPatch } from "diff";

function patchSendDialogue() {
    let sendDialogue = window.sendDialogue.toString();

    var patch = `--- original
+++ modified
@@ -1,6 +1,11 @@
 function sendDialogue(dialogue, i = 0) {
-    if(env.skipDialog) return; // don't proceed if there's a skip dialog
-
+    if (env.skipDialog) {
+        env.skipDialog.resume = () => {
+            sendDialogue(dialogue, i)
+        }
+        return;
+    }; // don't proceed if there's a skip dialog
+    
     try {
         env.currentDialogue.branch = dialogue
         let queue = dialogue.body
@@ -62,8 +67,16 @@
                 setTimeout(()=>{document.querySelector('.dialogue-message:last-of-type').classList.add('sent')}, current.autoAdvance ? 0 : 50)
 
                 //update the event listener to proceed to the next line
-                if(current.wait) dBox.classList.remove('dialogue-click-proceed')
-                env.dialogueWaitTimeout = setTimeout(()=>{
+                if(current.wait) {
+                    dBox.classList.remove('dialogue-click-proceed')
+                    dialogueProgressEvent = (event) => {
+                        if(event.key === "Escape") return skipDialogue();
+                    }
+                    document.addEventListener('keydown', dialogueProgressEvent)
+                }
+                env.dialogueWaitTimeout = setTimeout(() => {
+                    document.removeEventListener('keydown', dialogueProgressEvent)
+
                     if(current.autoAdvance) {
                         sendDialogue(dialogue, i + 1)
 
`;

    var patchedSendDialogue = applyPatch(sendDialogue, patch);

    if(!patchedSendDialogue) {
        console.error("Failed to patch sendDialogue function.");
        return;
    }

    //@ts-ignore
    window.sendDialogue = eval(patchedSendDialogue+ "; sendDialogue;");
}

function patchSkipDialogue() {
    //@ts-ignore
    const skipDialogue = window.skipDialogue.toString();

    var skippatch = `--- original
+++ modified
@@ -35,6 +35,12 @@
     }

     env.skipDialogNo = () => {
+        const resume = env.skipDialog.resume
+        if (env.skipDialog.resume) {
+            setTimeout(() => {
+                resume()
+            }, 50)
+        }
         env.skipDialog.remove()
         delete env.skipDialog
     }`
    
    var patchedSkipDialogue = applyPatch(skipDialogue, skippatch);
    if (!patchedSkipDialogue) {
        console.error("Failed to patch skipDialogue function.");
        return;
    }

    //@ts-ignore
    window.skipDialogue = eval(patchedSkipDialogue + "; skipDialogue;");
}

export function applyDialogueJsPatches() {
    patchSendDialogue();
    patchSkipDialogue();
}