define(['plugins/dialog', 'knockout', 'constructors/lecture'], function (dialog, ko, Lecture) {
    var DayScheduleModal = function (day) {
        this.date = day.date;
        this.lectures = ko.observableArray(day.lectures().slice().sort(function (first, second) {
            first = moment({ h: first.hours(), m: first.minutes(), s: 0, ms: 0 });
            second = moment({ h: second.hours(), m: second.minutes(), s: 0, ms: 0 });
            return first - second;
        }));
    };

    DayScheduleModal.prototype.addLecture = function () {
        this.lectures.push(new Lecture({ date: this.date }));
    };
    DayScheduleModal.prototype.deleteLecture = function (lecture, self) {
        self.lectures.remove(lecture);
    };
    DayScheduleModal.prototype.cancel = function () {
        dialog.close(this);
    };
    DayScheduleModal.prototype.save = function () {
        dialog.close(this, this.lectures());
    };
    DayScheduleModal.show = function (day) {
        return dialog.show(new DayScheduleModal(day));
    };

    return DayScheduleModal;
});