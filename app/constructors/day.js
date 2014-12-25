define(['knockout', 'moment'], function (ko, moment) {    
    var Day = function (data) {
        this.date = moment(data.date);
        this.lectures = ko.observableArray(data.lectures || []);
    };

    return Day;
});