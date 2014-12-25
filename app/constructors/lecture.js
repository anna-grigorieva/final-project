define(['knockout'], function (ko) {
    var Lecture = function (data) {
        this.date = moment(data.date);
        this.hours = ko.observable(data.hours || '00');
        this.minutes = ko.observable(data.minutes || '00');
        this.time = ko.computed(function () {
            return this.hours() + ':' + this.minutes();
        }, this);
        this.lectureRoom = ko.observable(data.lectureRoom || '');
        this.subject = ko.observable(data.subject || '');
        this.objectId = data.objectId || '';
    };

    return Lecture;
});