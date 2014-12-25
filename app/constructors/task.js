define(['knockout', 'moment'], function (ko, moment) {    
    var Task = function (data) {
        this.title = ko.observable(data.title || '');
        this.description = ko.observable(data.description || '');
        this.date = ko.observable(moment(data.date) || '');
        this.important = ko.observable(data.important || false);
        this.subject = ko.observable(data.subject || '');
        this.objectId = ko.observable(data.objectId || '');
    };

    return Task;
});