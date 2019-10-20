NB.BoardViewModel = function(): void {
  const self: any = this;
  self.attributeToIgnore = ["visible"];
  self.NotesVM = ko.observableArray();
  self.populateNotes(self.NotesVM, NB.board.getNotes());
  self.categoriesVM = ko.observableArray();
  self.populateCategories(self.categoriesVM, NB.board.getCategories());
  self.choosingCategory = ko.observable(false);
  self.curActiveCategory = self.categoriesVM()[0];
  self.moveUpCategoryDisabled = ko.observable(true);
  self.moveDownCategoryDisabled = ko.observable(true);
  self.canDeleteCategory = ko.observable(false);
  self.canEditCategory = ko.observable(false);

  self.sortOptions = ko.observableArray(["Ascending", "Descending"]);
  self.selectedSortOption = ko.observable();
  self.sort = {
    Ascending: function(note1, note2) {
      const timestamp = "timestamp";
      const note1Time = self.getObservableValue(note1, timestamp);
      const note2Time = self.getObservableValue(note2, timestamp);

      return note1Time - note2Time;
    },
    Descending: function(note1, note2) {
      const timestamp = "timestamp";
      const note1Time = self.getObservableValue(note1, timestamp);
      const note2Time = self.getObservableValue(note2, timestamp);
      return note2Time - note1Time;
    }
  };
  self.selectedSortOption.subscribe(function(sortOrder) {
    unsavedNotesVM = unsavedNotesVM.sort(self.sort[sortOrder]);
    self.NotesVM(self.NotesVM().sort(self.sort[sortOrder]));
  });

  // remove Note
  self.clickRemoveNote = function(note): void {
    const confirmElement: HTMLElement = self.confirmDelElement(note.id);
    const toHide: boolean = confirmElement.style.visibility === "visible";
    confirmElement.style.visibility = toHide ? "hidden" : "visible";
  };
  self.cancelRemoveNote = function(note): void {
    const confirmElement: HTMLElement = self.confirmDelElement(note.id);
    confirmElement.style.display = "none";
  };
  self.removeNote = function(note): void {
    self.NotesVM.remove(note);
    NB.board.removeNoteById(note.id);
  };
  self.confirmDelElement = function(id): HTMLElement {
    const selector: string = "[id='" + id + "'] .confirm";
    return document.querySelector(selector);
  };

  // search options
  self.searchQuery = ko.observable("");
  self.searchByText = ko.observable(true);
  self.searchByDate = ko.observable(false);
  self.filterBoard = function(): void {
    self.forEachNoteVM(function(note) {
      const content: string = note.content().toLowerCase();
      const date: string = note.lastModifiedTime();

      let sameContent: boolean = false;
      let sameDate: boolean = false;
      let sameCategory: boolean = false;
      if (self.searchByText()) {
        // match content
        sameContent = content.includes(self.searchQuery());
      }
      if (self.searchByDate()) {
        // match date
        sameDate = date.includes(self.searchQuery());
      }
      if (
        self.curActiveCategory.name() === self.generalCategoryName ||
        self.curActiveCategory.name() === note.category()
      ) {
        sameCategory = true;
      }
      note.visible((sameDate || sameContent) && sameCategory);
    });
  };

  self.resetSearch = function(): void {
    if (!self.noteInEditMode()) {
      self.searchQuery("");
      self.filterBoard();
    }
  };

  self.filterBoard();

  // Save , discard and update notes functions
  self.clickSave = function(): void {
    self.forEachNoteVM(function(note) {
      if (note.canDiscard()) {
        NB.board.updateNoteById(
          note.id,
          note.content(),
          Date.now(),
          note.category()
        );
        note.canDiscard(false);
        note.timestamp(Date.now());
      }
    });

    const newCategoriesList = JSON.parse(ko.toJSON(self.categoriesVM));
    NB.board.updateCategories(newCategoriesList);
    NB.board.save();

    unsavedNotesVM = JSON.parse(ko.toJSON(self.NotesVM()));
    unsavedCategoriesVM = JSON.parse(ko.toJSON(self.categoriesVM));

    // Trigger computed event
    self.NotesVM.valueHasMutated();
  };

  self.discardNote = function(note): void {
    const index: number = NB.board.getIndexById(note.id);
    const oldNote: any = unsavedNotesVM[index];

    // if the discarded note is not saved then discarding it will delete it
    oldNote
      ? self.NotesVM.replace(note, new NB.NoteVM(oldNote))
      : self.removeNote(note);
  };
  self.contentChange = function(note): void {
    const index: number = self.NotesVM.indexOf(note);
    const oldNote: any = unsavedNotesVM[index];
    if (oldNote) {
      note.canDiscard(note.content() !== oldNote.content);
    }
  };

  // section for restoring the user in the note edit if user exited the application while in Edit mode
  const _noteIndexInEditMode: any = NB.Storage.getNoteIndexInEditMode();
  // if the note wasn't saved before refresh it will return undefined
  const _noteInEditMode: any = self.NotesVM()[_noteIndexInEditMode];

  self.noteInEditMode = ko.observable(_noteInEditMode);

  self.clickEditNote = function(editNote): void {
    self.noteInEditMode(editNote);
  };

  self.backToBoard = function(): void {
    self.noteInEditMode(undefined);
  };
  self.choseCategory = function(category): void {
    self.curActiveCategory.active(false);
    self.curActiveCategory = category;
    self.curActiveCategory.active(true);
    const index = self.getCategoryIndex(category.name());
    self.activeMoveCategory(index);
    self.canDeleteCategory(index !== 0);
    self.canEditCategory(index !== 0);
    self.filterBoard();
  };
  self.activeMoveCategory = function(index): void {
    self.moveUpCategoryDisabled(index <= 1);
    self.moveDownCategoryDisabled(
      index >= self.categoriesVM().length - 1 || index === 0
    );
  };

  self.changeNoteCategory = function(note): void {
    self.choosingCategory(true);

    function clickEvent(event) {
      const target = event.target;
      if (target.className.includes("category")) {
        const name = target.innerText;
        const index: number = NB.board.getIndexById(note.id);
        const oldNote: any = unsavedNotesVM[index];
        self.NotesVM()[index].category(name);
        note.canDiscard(note.category() !== oldNote.category);
        self.filterBoard();
        event.stopPropagation();
      }
      self.choosingCategory(false);
      document.body.removeEventListener("click", clickEvent, true);
    }

    document.body.addEventListener("click", clickEvent, true);
  };

  window.onbeforeunload = function(): void {
    const index: number = self.NotesVM.indexOf(self.noteInEditMode());
    NB.Storage.saveChosenNote(index);
  };

  let unsavedNotesVM: any = JSON.parse(ko.toJSON(self.NotesVM()));
  let unsavedCategoriesVM: any = JSON.parse(ko.toJSON(self.categoriesVM()));

  self.selectedSortOption(self.sortOptions()[0]);
  self.canSaveCategories = function() {
    if (unsavedCategoriesVM.length !== self.categoriesVM().length) {
      return true;
    }
    for (let i = 0; i < self.categoriesVM().length; i++) {
      let unSavedCategory = unsavedCategoriesVM[i];
      let category = self.categoriesVM()[i];
      if (category.name() !== unSavedCategory.name) {
        return true;
      }
    }
    return false;
  };
  self.canSaveNotes = ko.computed(function() {
    const notesVM = self.NotesVM();
    if (unsavedNotesVM.length !== notesVM.length) {
      return true;
    }
    for (let i = 0; i < unsavedNotesVM.length; i++) {
      let unSavedNote = unsavedNotesVM[i];
      let note = notesVM[i];
      for (let attr in unSavedNote) {
        if (unSavedNote.hasOwnProperty(attr)) {
          let noteAttr = self.getObservableValue(note, attr);
          // attribute to ignore
          if (
            !self.attributeToIgnore.includes(attr) &&
            noteAttr !== unSavedNote[attr]
          ) {
            return true;
          }
        }
      }
    }
    return false;
  });
  self.changeNotesCategoryWithNewOne = function(
    oldCategory: string,
    newCategory: string
  ) {
    self.forEachNoteWithCategory(oldCategory, function(note) {
      note.category(newCategory);
    });
  };

  self.forEachNoteWithCategory = function(
    category: string,
    callback: Function
  ) {
    self.forEachNoteVM(function(note) {
      if (note.category() === category) {
        callback(note);
      }
    });
  };

  self.canSave = ko.computed(function(): any {
    const dirtyNotes = self.canSaveNotes();
    const dirtyCategories = self.canSaveCategories();
    return dirtyNotes || dirtyCategories;
  });
  self.editCategoryName = function(categories, event): void {
    self.blueTargetElement(event);
    const oldCategoryName = self.curActiveCategory.name();
    const newCategoryName = prompt(
      "Please enter a new category name",
      oldCategoryName
    );
    if (newCategoryName != null) {
      if (self.categoryNameExist(newCategoryName)) {
        window.alert("category name already exist");
      } else {
        self.changeNotesCategoryWithNewOne(oldCategoryName, newCategoryName);
        self.curActiveCategory.name(newCategoryName);
      }
    }
  };
  self.removeCategory = function(categories, event) {
    self.blueTargetElement(event);
    const activeCategoryName: string = self.curActiveCategory.name();
    const confirmDelete = confirm(
      "Are you sure you want to delete " + activeCategoryName + " category ?"
    );
    if (confirmDelete) {
      self.removeCategoryByName(self.curActiveCategory.name());
      self.choseCategory(self.categoriesVM()[0]);
    }
  };
};

NB.BoardViewModel.prototype = {
  generalCategoryName: "General",
  forEachNoteVM: function(callback): void {
    let notesVM = this.NotesVM();
    for (let i = 0, len = notesVM.length; i < len; i++) {
      callback(notesVM[i]);
    }
  },
  forEachCategoriesVM: function(callback): void {
    this.categoriesVM().forEach(function(category) {
      callback(category);
    });
  },
  populateNotes: function(notesVM, notes) {
    notes.forEach(function(note) {
      notesVM.push(new NB.NoteVM(note));
    });
  },
  populateCategories: function(categoriesVM, categories) {
    categoriesVM.push(new NB.CategoryVM(categories[0].name, true));
    for (let i = 1; i < categories.length; i++) {
      const categoryVM = new NB.CategoryVM(categories[i].name);
      categoriesVM.push(categoryVM);
    }
  },
  getObservableValue: function(observable, attr): any {
    // if attribute isn't an observable return actual value
    return typeof observable[attr] === "function"
      ? observable[attr]()
      : observable[attr];
  },
  addNote: function(): void {
    const id: number = NB.board.getNextId();
    const newNote: any = new NB.Note(id, this.curActiveCategory.name());
    NB.board.addNote(newNote);
    this.NotesVM.push(new NB.NoteVM(newNote, true));
    document.getElementById("addBtn").blur();
  },
  categoryNameExist: function(categoryName) {
    let exist = false;
    this.forEachCategoriesVM(function(category) {
      if (categoryName === category.name()) {
        exist = true;
      }
    });
    return exist;
  },
  getCategoryIndex: function(category = this.curActiveCategory.name()) {
    for (let i = 0; i < this.categoriesVM().length; i++) {
      if (this.categoriesVM()[i].name() === category) {
        return i;
      }
    }
    return 0;
  },
  getCategoryName: function() {
    const categories = ko.toJS(this.categoriesVM());
    const defaultNames = categories
      .filter(category => category.name.includes("default"))
      .sort((cat1, cat2) => {
        return cat1.name - cat2.name;
      });
    const name = defaultNames.length
      ? defaultNames[defaultNames.length - 1].name
      : "default";
    let lastestNum = name.match(/\d+$/);
    if (lastestNum !== null) {
      lastestNum = Number(lastestNum[0]) + 1;
    }
    return "default" + (lastestNum === null ? 1 : lastestNum);
  },
  addCategory: function() {
    const name = this.getCategoryName();
    const newCategory: any = new NB.Category(name);
    this.categoriesVM.push(new NB.CategoryVM(newCategory.name));
    // Remove focus
    const addButton: HTMLElement = document.getElementById("addCategory");
    addButton.blur();
  },
  removeCategoryByName: function(name) {
    let index = -1;
    for (let i = 0; i < this.categoriesVM().length; i++) {
      if (this.categoriesVM()[i].name() === name) {
        index = i;
      }
    }
    this.changeNotesCategoryWithNewOne(name, this.generalCategoryName);
    this.categoriesVM.splice(index, 1);
  },
  categoryMoveUp: function(categories, event) {
    this.blueTargetElement(event);

    const index = this.getCategoryIndex();
    if (index <= 1) {
      return;
    }
    const temp = this.categoriesVM()[index - 1];
    this.categoriesVM.replace(this.categoriesVM()[index], temp);
    this.categoriesVM.replace(
      this.categoriesVM()[index - 1],
      this.curActiveCategory
    );
    this.activeMoveCategory(index - 1);
  },
  categoryMoveDown: function(categories, event) {
    this.blueTargetElement(event);

    const index = this.getCategoryIndex();
    if (index === this.categoriesVM().length - 1) {
      return;
    }
    const temp = this.categoriesVM()[index + 1];
    this.categoriesVM.replace(
      this.categoriesVM()[index + 1],
      this.curActiveCategory
    );
    this.categoriesVM.replace(this.categoriesVM()[index], temp);
    this.activeMoveCategory(index + 1);
  },
  blueTargetElement: function(event) {
    event && event.target.blur();
  }
};
