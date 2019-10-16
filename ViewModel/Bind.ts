NB.boardVM = new NB.BoardViewModel();

(function(): void {
  window.onload = function(): void {
    ko.applyBindings(NB.boardVM);
  };
})();
