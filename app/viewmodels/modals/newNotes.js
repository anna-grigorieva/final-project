define(['plugins/dialog', 'knockout'], function (dialog, ko) {
    var NewNotesModal = function () {
        this.title = ko.observable();
    };

    NewNotesModal.prototype.ok = function () {
        dialog.close(this, this.title());
    };
    NewNotesModal.prototype.cancel = function () {
        dialog.close(this);
    };
    NewNotesModal.show = function () {
        return dialog.show(new NewNotesModal());
    };

    return NewNotesModal;
});