NB.Note = class {
    id: number;
    content: string;
    timestamp: number;
    x: number;
    y: number;
    category: string;
    constructor(id,category) {
        this.id = id;
        this.content = '';
        this.timestamp = Date.now();
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.category = category || "General";
    }
};