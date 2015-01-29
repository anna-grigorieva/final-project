define(['durandal/app', 'plugins/dialog'], function (app, dialog) {
    var DayScheduleModal = function (day, lectureHours) {
        this.date = day.date;
        this.lectures = day.lectures;
        this.lectureHours = lectureHours;
    };
    DayScheduleModal.prototype.clear = function (lecture) {
        lecture.subject('');
        lecture.lectureRoom('');
    };
    DayScheduleModal.prototype.close = function () {
        dialog.close(this, false);
    };
    DayScheduleModal.prototype.save = function () {
        dialog.close(this, true);
    };
    DayScheduleModal.show = function (day, lectureHours) {
        return dialog.show(new DayScheduleModal(day, lectureHours));
    };

    return DayScheduleModal;
});