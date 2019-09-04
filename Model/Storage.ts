NB.Storage = {
    getDataFromStorage: function (): any {
        if (localStorage.Board) {
            try {
                this.storedBoard = JSON.parse(localStorage.Board);
                this.checkData();
            } catch (e) {
                console.error(e);
                this.storedBoard = this.reset();
            }
        } else {
            this.storedBoard = this.reset();
        }
    },
    checkData: function (): any {
        if (!this.storedBoard.categories || this.storedBoard.categories.length === 0) {
            this.storedBoard.categories = this.getDefaultCategories();
        }
        if (!this.storedBoard.notes) {
            this.storedBoard.notes = [];
        }
    },
    getDefaultCategories: function () {
        return [new NB.Category("General", true)]
    },
    reset: function (): any {
        return {
            notes: [],
            currentID: 0,
            chosenNoteINDEX: undefined,
            categories: this.getDefaultCategories()
        };
    },
    getCategories: function (): any {
        return this.storedBoard.categories;
    },
    getEditMode: function (): boolean {
        return this.storedBoard.editMode;
    },
    getStoredBoard: function (): any {
        return this.storedBoard;
    },
    getNoteIndexInEditMode: function (): number {
        return this.storedBoard.chosenNoteINDEX;
    },
    getNotes: function (): Array<any> {
        return this.storedBoard.notes;
    },
    getCurrentID: function (): number {
        return this.storedBoard.currentID;
    },
    saveToStorage: function (notes, id, categories): void {
        this.storedBoard.notes = notes;
        this.storedBoard.currentID = id;
        this.storedBoard.categories = categories;
        localStorage.Board = JSON.stringify(this.storedBoard);
    },
    saveChosenNote: function (index): void {
        const temp: any = JSON.parse(localStorage.Board);
        temp.chosenNoteINDEX = index;
        localStorage.Board = JSON.stringify(temp);
    }
};

NB.Storage.getDataFromStorage();
