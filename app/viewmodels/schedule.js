define(['durandal/app', 'knockout', 'dataContext', 'userContext', 'moment', 'Q', 'constructors/day', 'constructors/lecture', 'viewmodels/modals/daySchedule'], function (app, ko, dataContext, userContext, moment, Q, Day, Lecture, DayScheduleModal) {
    var
        monday = ko.observable(moment({ h: 0, m: 0, s: 0, ms: 0 }).day("Monday")),
        week = ko.computed(getWeekInterval),
        lectureHours = ko.observableArray(),
        days = ko.observableArray(),
        dateSubscr,
        timeToAdd = {
            hours: ko.observable('00'),
            minutes: ko.observable('00')
        },
        isBusy = ko.observable(false);

    return {
        monday: monday,
        lectureHours: lectureHours,
        days: days,
        week: week,
        timeToAdd: timeToAdd,
        isBusy: isBusy,

        editDaySchedule: editDaySchedule,
        addLectureTime: addLectureTime,
        deleteLectureTime: deleteLectureTime,

        activate: activate,
        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        deactivate: function () {
            dateSubscr.dispose();
        }
    };

    function activate() {
        monday(moment({ h: 0, m: 0, s: 0, ms: 0 }).day("Monday"));
        dateSubscr = monday.subscribe(setWeekSchedule);

        return dataContext.getCollection({
            className: 'LectureTime'
        }).then(function (recievedLectureHours) {
            setLectureHours(recievedLectureHours);
            return setWeekSchedule(monday());
        });
    }

    function editDaySchedule(day) {
        DayScheduleModal.show(day, lectureHours).then(function (isUpdateNeeded) {
            if (isUpdateNeeded) {
                updateData(day);
            } else {
                setWeekSchedule(monday());
            }
        });
    }
    function addLectureTime() {
        var
            newTime = timeToAdd.hours() + ':' + timeToAdd.minutes(),
            updatedDays,
            i;

        for (i = 0; i < lectureHours().length; i++) {
            if (lectureHours()[i].time === newTime) {
                timeToAdd.hours('00');
                timeToAdd.minutes('00');
                return;
            }
        }

        isBusy(true);

        return dataContext.add({
            className: 'LectureTime',
            data: { time: newTime }
        }).then(function (id) {
            lectureHours.push({ time: newTime, objectId: id });
            lectureHours.sort(function (first, second) {
                first = moment(first.time, 'HH:mm');
                second = moment(second.time, 'HH:mm');
                return first - second;
            });
            for (i = 0; i < days().length; i++) {
                days()[i].lectures[newTime] = ko.observable(new Lecture({
                    date: days()[i].date
                        .hours(moment(newTime, 'HH:mm').hours())
                        .minutes(moment(newTime, 'HH:mm').minutes())
                }));
            }
            updatedDays = days();
            days([]);
            days(updatedDays);
            timeToAdd.hours('00');
            timeToAdd.minutes('00');

            isBusy(false);
        });
    }
    function deleteLectureTime(lectureTime) {
        var
            lecturesToRemove = [],
            i;

        app.showMessage('Do you want to remove all lectures for this time?', '', ['No', 'Yes'], true)
            .then(function (dialogResult) {
                if (dialogResult == 'Yes') {
                    isBusy(true);

                    return dataContext.remove({
                        className: 'LectureTime',
                        id: lectureTime.objectId
                    }).then(function () {
                        return removeLectures();
                    }).then(function () {
                        lectureHours.remove(lectureTime);
                        for (i = 0; i < days().length; i++) {
                            delete days()[i].lectures[lectureTime.time];
                        }

                        isBusy(false);
                    });
                } else {
                    return;
                }
            });

        function removeLectures() {
            return dataContext.getCollection({
                className: 'Lecture'
            }).then(function (weekLectures) {
                for (i = 0; i < weekLectures.length; i++) {
                    if (moment(weekLectures[i].date).format('HH:mm') === lectureTime.time) {
                        lecturesToRemove.push(weekLectures[i]);
                    }
                }
                return dataContext.removeCollection({ className: 'Lecture', items: lecturesToRemove });
            });
        }
    }

    function setLectureHours(recievedLectureHours) {
        var
            lectureTime = [],
            i;

        for (i = 0; i < recievedLectureHours.length; i++) {
            lectureTime.push({
                time: recievedLectureHours[i].time,
                objectId: recievedLectureHours[i].objectId
            });
        }
        lectureTime.sort(function (first, second) {
            first = moment(first.time, 'HH:mm');
            second = moment(second.time, 'HH:mm');
            return first - second;
        });
        lectureHours(lectureTime);
    }
    function setWeekSchedule(monday) {
        isBusy(true);

        return dataContext.getCollection({
            className: 'Lecture',
            queryConstraints: {
                date: {
                    $gte: moment(monday).day("Monday"),
                    $lte: moment(monday).day("Friday")
                }
            }
        }).then(function (weekLectures) {
            setDays(monday);
            setLectures(weekLectures);

            isBusy(false);
        });
    }
    function setDays(monday) {
        var
            daysOfWeek = [],
            i;

        for (i = 0; i < 5; i++) {
            daysOfWeek.push(new Day({
                date: moment(monday).day(i + 1),
                lectureHours: lectureHours()
            }));
        }
        days(daysOfWeek);
    }
    function setLectures(weekLectures) {
        weekLectures.forEach(function (lecture) {
            lecture = new Lecture(lecture);
            days().forEach(function (day) {
                if (day.date.format('MM/DD/YYYY') === lecture.date.format('MM/DD/YYYY')) {
                    day.lectures[lecture.date.format('HH:mm')](lecture);
                }
            });
        });
    }
    function updateData(day) {
        isBusy(true);

        return lectureHours()
            .reduce(updateLectureData, Q.resolve())
            .then(function () {
                isBusy(false);
            });

        function updateLectureData(saveData, lectureTime) {
            var
                updatedLecture = day.lectures[lectureTime.time](),
                updatedData = {
                    subject: updatedLecture.subject(),
                    lectureRoom: updatedLecture.lectureRoom()
                };

            return saveData.then(function () {
                if (updatedLecture.subject() || updatedLecture.lectureRoom()) {
                    updatedLecture.subject(updatedLecture.subject() || 'Some lecture');
                    if (updatedLecture.objectId) {
                        return dataContext.update({
                            className: 'Lecture',
                            id: updatedLecture.objectId,
                            data: updatedData
                        });
                    } else {
                        updatedData.date = updatedLecture.date;
                        return dataContext.add({
                            className: 'Lecture',
                            data: updatedData
                        }).then(function (id) {
                            updatedData.objectId = id;
                        });
                    }
                } else {
                    if (updatedLecture.objectId) {
                        return dataContext.remove({
                            className: 'Lecture',
                            id: updatedLecture.objectId
                        }).then(function () {
                            updatedLecture.lectureRoom('');
                        });
                    } else {
                        return Q.resolve();
                    }
                }
            });
        }
    }
    function getWeekInterval() {
        var
            friday = moment(monday()).day("Friday"),
            monMonth = monday().format('MMM'),
            friMonth = friday.format('MMM');

        return monMonth + ', ' + monday().format('Do') + ' - ' +
            ((friMonth == monMonth) ? '' : (friMonth + ', ')) + friday.format('Do');
    }
});