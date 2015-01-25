define(['knockout', 'moment'], function (ko, moment) {
    var Event = function (data) {
        this.name = ko.observable(data.name || 'New event');
        this.date = ko.observable(moment(data.date));
        this.description = ko.observable(data.description || '');
        this.important = ko.observable(data.important || false);
        this.subject = ko.observable(data.subject || '');
        this.objectId = ko.observable(data.objectId || '');
    };

    return Event;
});