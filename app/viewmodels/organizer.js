define(['knockout', 'moment', 'dataContext', 'userContext'], function (ko, moment, dataContext, userContext) {
    var
        selectedDate = ko.observable(),
        calendarWeeks = ko.observableArray(),
        lectures = ko.observableArray(),
        isToday = function (day) {
            var today = moment();
            return day == today.date() &&
                selectedDate().month() == today.month() &&
                selectedDate().year() == today.year();
        },
        isSelected = function (day) {
            return day == selectedDate().date();
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
        importantDays,
        isBusy = ko.observable(false),
        isCalendarRefreshing = ko.observable(false);

    return {
        selectedDate: selectedDate,
        calendarWeeks: calendarWeeks,
        lectures: lectures,
        isToday: isToday,
        isSelected: isSelected,
        isImportant: isImportant,
        importantDays: importantDays,
        isBusy: isBusy,
        isCalendarRefreshing: isCalendarRefreshing,

        changeDay: changeDay,
        changeMonth: changeMonth,

        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        activate: activate
    };

    function activate() {
        selectedDate(moment({ h: 0, m: 0, s: 0, ms: 0 }));

        return setLectures(selectedDate()).then(function () {
            return dataContext.getImportantDays(selectedDate());
        }).then(function (days) {
            importantDays = days;
            refreshCalendar();
        });
    }

    function changeDay(date) {
        if (!date) return;

        var
            year = selectedDate().year(),
            month = selectedDate().month(),
            newDate = moment([year, month, date]);

        isBusy(true);

        setLectures(newDate).then(function () {
            selectedDate(newDate);
            isBusy(false);
        });
    }
    function changeMonth(monthShift) {
        var
            year = selectedDate().year(),
            month = selectedDate().month() + monthShift,
            newDate = moment(new Date(year, month, 1));

        isBusy(true);
        isCalendarRefreshing(true);

        setLectures(newDate).then(function () {
            return dataContext.getImportantDays(newDate);
        }).then(function () {
            selectedDate(newDate);
            refreshCalendar();

            isBusy(false);
            isCalendarRefreshing(false);
        });
    }

    function setLectures(newDate) {
        return dataContext.getCollection({
            className: 'Lecture',
            queryConstraints: {
                date: {
                    $gte: newDate,
                    $lt: moment(newDate).add(1, 'd')
                }
            }
        }).then(function (recivedLectures) {
            lectures(recivedLectures.sort(function (first, second) {
                return moment(first.date) - moment(second.date);
            }));
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