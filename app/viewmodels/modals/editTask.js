define(['plugins/dialog', 'knockout', 'moment'], function (dialog, ko, moment) {
    var EditTaskModal = function (task) {
        this.title = ko.observable(task.title());
        this.description = ko.observable(task.description());
        this.date = ko.observable(task.date());
        this.important = ko.observable(task.important());
        this.subject = ko.observable(task.subject());
    };

    EditTaskModal.prototype.cancel = function () {
        dialog.close(this);
    };
    EditTaskModal.prototype.save = function () {
        dialog.close(this, {
            title: this.title(),
            description: this.description(),
            date: moment(this.date()),
            important: this.important(),
            subject: this.subject()
        });
    };
    EditTaskModal.show = function (task) {
        return dialog.show(new EditTaskModal(task));
    };

    return EditTaskModal;
});