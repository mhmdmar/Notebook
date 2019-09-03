NB.CategoryVM = class {
    name: any;
    active: any;

    constructor(name, active) {
        const self = this;
        self.name = ko.observable(name);
        self.active = ko.observable(active);
    }
};

