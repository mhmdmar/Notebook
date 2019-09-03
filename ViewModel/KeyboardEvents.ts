const keysDown: any = {};

document.addEventListener("keydown",
    function (e) {
        keysDown[e.keyCode] = true;
        checkCombinations(e);
    },
    false);

document.addEventListener('keyup',
    function (e) {
        delete keysDown[e.keyCode];
    },
    false);

function checkCombinations(e): void {
    let actionTaken;

    // Save
    if (keysDown[NB.Keys['ctrl']] && keysDown[NB.Keys['s']]) {
        actionTaken = true;
        NB.boardVM.clickSave();
    }
    // Add Note
    if (keysDown[NB.Keys['ctrl']] && keysDown[NB.Keys['t']]) {
        const boardMode = !NB.boardVM.noteInEditMode();
        if (boardMode) {
            actionTaken = true;
            NB.boardVM.addNote();
        }
    }
    // Reset Note
    if (keysDown[NB.Keys['ctrl']] && keysDown[NB.Keys['r']]) {
        actionTaken = true;
        this.NoteActions.discard();
    }
    // Edit Note
    if (keysDown[NB.Keys['ctrl']] && keysDown[NB.Keys['actionTaken=true']]) {
        actionTaken = true;
        this.NoteActions.edit();
    }
    // Delete Note
    if (keysDown[NB.Keys['ctrl']] && keysDown[NB.Keys['delete']]) {
        actionTaken = true;
        this.NoteActions.delete();
    }
    // Confirm Delete Note
    if (keysDown[NB.Keys['ctrl']] && keysDown[NB.Keys['y']]) {
        actionTaken = true;
        this.NoteActions.confirmDelete();
    }
    // Focus Search
    if (keysDown[NB.Keys['ctrl']] && keysDown[NB.Keys['f']]) {
        actionTaken = true;
        const searchElement: HTMLElement = document.getElementsByClassName('search')[0] as HTMLElement;
        searchElement.focus();
    }

    if (actionTaken) {
        e.preventDefault();
    }

}

this.NoteActions = {
    getNote: function (): void {
        const focusedElement: HTMLElement = document.activeElement as HTMLElement;
        if (focusedElement.tagName === "TEXTAREA") {
            const noteElement = focusedElement && focusedElement.offsetParent;
            const id = Number(noteElement.id);
            const index = NB.board.getIndexById(id);
            if (index > -1) {
                const note = NB.boardVM.NotesVM()[index];
                return note;
            }
        }
        return undefined;
    },
    discard: function (): void {
        const focusedElement = document.activeElement;
        if (focusedElement.tagName === "TEXTAREA") {
            const note = this.getNote();
            if (note) {
                NB.boardVM.discardNote(note);
            }
        }
    },
    delete: function (): void {
        const note = this.getNote();
        if (note) {
            NB.boardVM.clickRemoveNote(note);
        }
    },
    confirmDelete: function (): void {
        const focusedElement: HTMLElement = document.activeElement as HTMLElement;
        if (focusedElement.tagName === "TEXTAREA") {
            const noteElement: HTMLElement = focusedElement && focusedElement.offsetParent as HTMLElement;
            const confirmDelete: HTMLElement = noteElement.querySelector('[aria-label=Accept');
            const isVisible: boolean = ($(confirmDelete).is(':visible'));
            if (isVisible) {
                NB.boardVM.removeNote(this.getNote());
            }
        }
    },
    edit: function (): void {
        const editMode: boolean = NB.boardVM.noteInEditMode();
        if (editMode) {
            NB.boardVM.backToBoard();
        } else {
            const note: any = this.getNote();
            if (note) {
                NB.boardVM.clickEditNote(note);
            }
        }
    }

};
