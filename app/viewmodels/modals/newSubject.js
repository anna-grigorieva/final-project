define(['plugins/dialog', 'knockout'], function (dialog, ko) {
    var NewSubjectModal = function () {
        this.subjectName = ko.observable();
    };

    NewSubjectModal.prototype.ok = function () {
        dialog.close(this, this.subjectName());
    };
    NewSubjectModal.prototype.cancel = function () {
        dialog.close(this);
    };
    NewSubjectModal.show = function () {
        return dialog.show(new NewSubjectModal());
    };

    return NewSubjectModal;
});