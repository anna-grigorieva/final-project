define(['knockout', 'moment', 'dataContext', 'userContext'], function (ko, moment, dataContext, userContext) {
    var
        selectedDate = ko.observable(),
        calendarWeeks = ko.observableArray(),
        lectures = ko.observableArray(),
        events = ko.observableArray(),
        isSelected = function (day) {
            return selectedDate().date() == day;
        },
        isImportant = function (day) {
            var len = importantDays().length,
                i;
            for (i = 0; i < len; i++) {
                if (moment(importantDays()[i]).date() == day) {
                    return true;
                }
            }
            return false;
        },
        importantDays;

    return {
        selectedDate: selectedDate,
        calendarWeeks: calendarWeeks,
        lectures: lectures,
        events: events,
        isSelected: isSelected,
        isImportant: isImportant,
        importantDays: importantDays,

        changeDay: changeDay,
        changeMonth: changeMonth,

        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        activate: activate
    };

    function changeDay(date) {
        var
            year = selectedDate().year(),
            month = selectedDate().month(),
            newDate = moment([year, month, date]);

        getData(newDate).then(function () {
            selectedDate(newDate);
        });
    }
    function changeMonth(monthShift) {
        var
            year = selectedDate().year(),
            month = selectedDate().month() + monthShift,
            newDate = moment(new Date(year, month, 1));

        getData(newDate).then(function () {
            return dataContext.getImportantDays(newDate);
        }).then(function () {
            selectedDate(newDate);
            refreshCalendar();
        });
    }


    //---------------------------------------------------------//
    function activate() {
        selectedDate(moment({ h: 0, m: 0, s: 0, ms: 0 }));

        return getData(selectedDate()).then(function () {
            return dataContext.getImportantDays(selectedDate())
                .then(function (days) {
                    importantDays = days;
                    refreshCalendar();
                });
        });
    }

    function getData(newDate) {
        dataContext.getCollection({ className: 'Lecture', queryConstraints: { date: newDate } })
            .then(function (recivedLectures) {
                lectures(recivedLectures.sort(function (first, second) {
                    first = moment({ h: first.hours, m: first.minutes, s: 0, ms: 0 });
                    second = moment({ h: second.hours, m: second.minutes, s: 0, ms: 0 });
                    return first - second;
                }));
            });
        return dataContext.getCollection({ className: 'Event', queryConstraints: { date: newDate } })
            .then(function (recivedEvents) {
                events(recivedEvents);
            });
    }
    function refreshCalendar() {
        var
            month = selectedDate().month(),
            currantDate = moment([selectedDate().year(), month]),
            currantDay = currantDate.day(),
            weeks = [[]],
            last = 0,
            i;

        if (currantDay != 0) {
            for (i = 0; i < currantDay ; i++) {
                weeks[0].push('');
            }
        }
        while (currantDate.month() == month) {
            weeks[last].push(currantDate.date());
            if (currantDate.day() == 6) {
                weeks.push([]);
                last++;
            }
            currantDate.date(currantDate.date() + 1);
        }
        currantDay = currantDate.day();
        if (currantDay != 0) {
            for (i = currantDay; i < 7; i++) {
                weeks[last].push('');
            }
        }

        calendarWeeks(weeks);
    }
});