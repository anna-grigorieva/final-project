define(function () {
    var
        hh = (function () {
            var hours = [], hour, i;
            for (i = 0; i < 24; i++) {
                hour = (i < 10) ? '0' + i : '' + i;
                hours.push(hour);
            }
            return hours;
        })(),
        mm = (function () {
            var minutes = [], minute, i;
            for (i = 0; i < 60; i += 5) {
                minute = (i < 10) ? '0' + i : '' + i;
                minutes.push(minute);
            }
            return minutes;
        })();

    return {
        hh: hh,
        mm: mm
    };
});