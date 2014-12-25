define(['knockout', 'dataContext', 'userContext', 'moment', 'constructors/day', 'constructors/lecture', 'viewmodels/modals/daySchedule'], function (ko, dataContext, userContext, moment, Day, Lecture, DayScheduleModal) {
    var
        monday = ko.observable(moment({ h: 0, m: 0, s: 0, ms: 0 })),
        week = ko.computed(function () {
            var
                friday = moment(monday()).day("Friday"),
                monMonth = monday().format('MMM'),
                friMonth = friday.format('MMM');

            return monMonth + ', ' + monday().date() + ' - ' +
                ((friMonth == monMonth) ? '' : (friMonth + ', ')) + friday.date();
        }),
        lectureHours = ko.observableArray(),
        days = ko.observableArray(),
        dateSubscr;

    return {
        monday: monday,
        lectureHours: lectureHours,
        days: days,
        week: week,

        addTime: addTime,
        showModalDialog: showModalDialog,

        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        activate: function () {
            monday(moment({ h: 0, m: 0, s: 0, ms: 0 }));
            dateSubscr = monday.subscribe(getLectures);
            return getLectures(monday());
        },
        deactivate: function () {
            dateSubscr.dispose();
        }
    };

    function showModalDialog(day) {
        DayScheduleModal.show(day)
            .then(function (lectures) {
                if (lectures) {
                    lectures.forEach(function (updatedLecture) {
                        var
                            updatedData = {
                                date: updatedLecture.date,
                                hours: updatedLecture.hours(),
                                minutes: updatedLecture.minutes(),
                                lectureRoom: updatedLecture.lectureRoom(),
                                subject: updatedLecture.subject()
                            };

                        if (updatedLecture.objectId) {
                            dataContext.update({
                                className: 'Lecture',
                                id: updatedLecture.objectId,
                                data: updatedData
                            });
                        } else {
                            dataContext.add({
                                className: 'Lecture',
                                data: updatedData
                            }).then(function (id) {
                                updatedLecture.objectId = id;
                                day.lectures.push(updatedLecture);
                                lectureHours(getTime());
                            });
                        }
                    });
                    day.lectures().forEach(function (oldLecture) {
                        if (lectures.indexOf(oldLecture) == -1) {
                            dataContext.remove({
                                className: 'Lecture',
                                id: oldLecture.objectId
                            }).then(function () {
                                day.lectures.remove(oldLecture);
                                lectureHours(getTime());
                            });
                        }
                    });
                } else {
                    return getLectures(day.date);
                }
            });
    }
    function addTime() {
        lectureHours.push(selectedTime.hours() + ':' + selectedTime.minutes());
        selectedTime.hours('00');
        selectedTime.minutes('00');
    }

    function getLectures(monday) {
        return dataContext.getCollection({
            className: 'Lecture',
            queryConstraints: {
                date: {
                    $gte: moment(monday).day("Monday"),
                    $lte: moment(monday).day("Friday")
                }
            }
        }).then(function (recievedLectures) {
            if (recievedLectures.length) {
                var
                    observableLectures = [],
                    number = recievedLectures.length,
                    i;

                for (i = 0; i < number; i++) {
                    observableLectures.push(new Lecture(recievedLectures[i]));
                }
                days(getDays(observableLectures));
                lectureHours(getTime());
            } else {
                days(getDays([]));
                lectureHours([]);
            }
        });
    }
    function getTime() {
        var
            daysArr = days(),
            time = {},
            timeArr = [],
            t, i, j;

        for (i = 0; i < 5; i++) {
            for (j = 0; j < daysArr[i].lectures().length; j++) {
                time[daysArr[i].lectures()[j].time()] = true;
            }
        }
        for (t in time) {
            timeArr.push(t);
        }
        timeArr.sort(function (first, second) {
            first = moment({ h: first.substr(0, 2), m: first.substr(3, 2), s: 0, ms: 0 });
            second = moment({ h: second.substr(0, 2), m: second.substr(3, 2), s: 0, ms: 0 });
            return first - second;
        });

        return timeArr;
    }
    function getDays(lectures) {
        var computedDays = [],
            i;
        for (i = 1; i <= 5; i++) {
            computedDays.push(new Day({ date: moment(monday()).day(i) }));
        }
        computedDays.forEach(function (day) {
            day.lectures(ko.utils.arrayFilter(lectures, function (lecture) {
                return lecture.date.toString() == day.date.toString();
            }));
        });
        return computedDays;
    }
});