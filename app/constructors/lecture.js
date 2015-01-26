define(['knockout', 'moment'], function (ko, moment) {
    var Lecture = function (data) {
        this.date = moment(data.date);
        this.lectureRoom = ko.observable(data.lectureRoom || '');
        this.subject = ko.observable(data.subject || '');
        this.objectId = ko.observable(data.objectId || '');
    };

    return Lecture;
});