NB.Board = class {
  notes: any;
  latestNoteID: number;
  categories: Array<string>;

  constructor() {
    this.notes = NB.Storage.getNotes();
    this.latestNoteID = NB.Storage.getCurrentID();
    this.categories = NB.Storage.getCategories();
  }

  getNotes(): Array<any> {
    return this.notes;
  }

  getCategories(): Array<string> {
    return this.categories;
  }

  addNote(note): void {
    let id: number;
    if (!note) {
      id = this.getNextId();
    }
    this.notes.push(note || new NB.Note(id));
  }

  getNextId(): number {
    const id: number = this.latestNoteID;
    this.latestNoteID++;
    return id;
  }

  getIndexById(id): number {
    return this.notes.findIndex(note => note.id === id);
  }

  removeNoteById(id): void {
    const index: number = this.getIndexById(id);
    this.notes.splice(index, 1);
  }

  updateCategories(categories): void {
    this.categories = categories;
  }

  updateNoteById(id, content, timestamp, category): void {
    const index: number = this.getIndexById(id);
    const note: any = this.notes[index];
    note.content = content;
    note.timestamp = timestamp;
    note.category = category;
  }

  save(): void {
    NB.Storage.saveToStorage(this.notes, this.latestNoteID, this.categories);
  }
};
NB.board = new NB.Board();
