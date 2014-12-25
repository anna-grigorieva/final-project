define(['knockout'], function (ko) {
    var Event = function (data) {
        this.name = ko.observable(data.name || '');
        this.date = ko.observable(moment(data.date) || '');
        this.hours = ko.observable(data.hours || '00');
        this.minutes = ko.observable(data.minutes || '00');
        this.time = ko.computed(function () {
            return this.hours() + ':' + this.minutes();
        }, this);
        this.description = ko.observable(data.description || '');
        this.important = ko.observable(data.important || false);
        this.subject = ko.observable(data.subject || '');
        this.objectId = ko.observable(data.objectId || '');
    };

    return Event;
});