define(['plugins/dialog', 'knockout', 'moment'], function (dialog, ko, moment) {
    var EditEventModal = function (event) {
        this.name = ko.observable(event.name());
        this.description = ko.observable(event.description());
        this.date = ko.observable(event.date());
        this.hours = ko.observable(moment(event.date()).format('HH'));
        this.minutes = ko.observable(moment(event.date()).format('mm'));
        this.important = ko.observable(event.important());
        this.subject = ko.observable(event.subject());
    };

    EditEventModal.prototype.cancel = function () {
        dialog.close(this);
    };
    EditEventModal.prototype.save = function () {
        dialog.close(this, {
            name: this.name(),
            description: this.description(),
            date: moment(this.date())
                .hours(parseInt(this.hours(), 10))
                .minutes(parseInt(this.minutes(), 10)),
            important: this.important(),
            subject: this.subject()
        });
    };
    EditEventModal.show = function (event) {
        return dialog.show(new EditEventModal(event));
    };

    return EditEventModal;
});