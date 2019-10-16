NB.NoteVM = class {
  id: number;
  content: any;
  timestamp: any;
  lastModifiedTime: any;
  x: number;
  y: number;
  canDiscard: any;
  level: any;
  visible: any;
  dirtyFlag: any;
  category: any;

  constructor(note, canDiscard) {
    const self = this;
    self.id = note.id;
    self.content = ko.observable(note.content || "");
    self.timestamp = ko.observable(note.timestamp);
    self.lastModifiedTime = ko.computed(function() {
      const timestampToDate = NB.Utils.timeStampToDate(self.timestamp());
      return timestampToDate.time + "-" + timestampToDate.date;
    });
    self.x = window.innerWidth / 2;
    self.y = window.innerHeight / 2;
    self.canDiscard = ko.observable(canDiscard || false);
    self.level = ko.observable(note.level || 1);
    self.visible = ko.observable(true);
    self.category = ko.observable(note.category || "default");
  }
};
