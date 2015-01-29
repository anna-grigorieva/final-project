define(['knockout', 'moment', 'constructors/lecture'], function (ko, moment, Lecture) {
    var Day = function (data) {
        var that = this;

        this.date = moment(data.date);
        this.lectures = (function () {
            var
                lectures = {},
                lectureHours = data.lectureHours,
                time,
                i;

            for (i = 0; i < lectureHours.length; i++) {
                time = lectureHours[i].time;
                lectures[time] = ko.observable(new Lecture({
                    date: that.date
                        .hours(moment(time, 'HH:mm').hours())
                        .minutes(moment(time, 'HH:mm').minutes())
                }));
            }
            return lectures;
        })();
    };

    return Day;
});