define(['knockout', 'moment'], function (ko, moment) {
    var Card = function (data) {
        var dueDate = moment(data.dueDate);
        dueDate = (dueDate < moment()) ? moment() : dueDate;

        this.front = ko.observable(data.front || '');
        this.back = ko.observable(data.back || '');
        this.dueDate = ko.observable(dueDate);
        this.repetition = data.repetition || 0;
        this.interval = data.interval || 1;
        this.easinessFactor = data.easinessFactor || 2.5;
        this.deck = data.deck || '';
        this.objectId = data.objectId || '';
    };

    return Card;
});