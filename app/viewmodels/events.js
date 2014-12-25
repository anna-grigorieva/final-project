define(['knockout', 'moment', 'dataContext', 'constructors/event'], function (ko, moment, dataContext, Event) {
    var
        today = moment({ h: 0, m: 0, s: 0, ms: 0 }),
        selectedDate = ko.observable(),
        dateSubscr,
        subject = ko.observable(),

        events = ko.observableArray(),
        eventToEdit = ko.observable(),
        eventToSave = {
            name: ko.observable('New event'),
            description: ko.observable(''),
            important: ko.observable(false),
            date: ko.observable(selectedDate()),
            hours: ko.observable('00'),
            minutes: ko.observable('00'),
            subject: ko.observable()
        };

    return {
        subject: subject,

        events: events,
        eventToEdit: eventToEdit,
        eventToSave: eventToSave,

        startEditingEvent: startEditingEvent,
        updateEvent: updateEvent,
        addEvent: addEvent,
        deleteEvent: deleteEvent,
        reset: reset,

        activate: activate,
        detached: detached
    };

    function startEditingEvent(event) {
        eventToSave.name(event.name());
        eventToSave.hours(event.hours());
        eventToSave.minutes(event.minutes());
        eventToSave.description(event.description());
        eventToSave.date(event.date());
        eventToSave.important(event.important());

        eventToEdit(event);
    }
    function updateEvent() {
        var
            updatedEvent = {
                name: eventToSave.name(),
                description: eventToSave.description(),
                hours: eventToSave.hours(),
                minutes: eventToSave.minutes(),
                date: moment(eventToSave.date()),
                important: eventToSave.important(),
                subject: eventToSave.subject()
            };

        return dataContext.update({
            className: 'Event',
            id: eventToEdit().objectId(),
            data: updatedEvent
        }).then(function () {
                        
            if (updatedEvent.date.toString() != eventToEdit().date().toString()) {
                dataContext.correctImportantDays(false, eventToEdit().date());
                dataContext.correctImportantDays(updatedEvent.important, updatedEvent.date);

                events.remove(eventToEdit());
            } else
                if (updatedEvent.important != eventToEdit().important()) {
                    dataContext.correctImportantDays(updatedEvent.important, updatedEvent.date);
                }

            for (data in updatedEvent) {
                eventToEdit()[data](updatedEvent[data]);
            }

            reset();
        })
    }
    function addEvent() {
        var
            createdEvent = {
                name: eventToSave.name(),
                description: eventToSave.description(),
                hours: eventToSave.hours(),
                minutes: eventToSave.minutes(),
                date: moment(eventToSave.date()),
                important: eventToSave.important(),
                subject: eventToSave.subject()
            };

        return dataContext.add({
            className: 'Event',
            data: createdEvent
        }).then(function (objectId) {
            createdEvent.objectId = objectId;
            events.push(new Event(createdEvent));

            if (createdEvent.important) {
                dataContext.correctImportantDays(true, createdEvent.date);
            }

            reset();
            return objectId;
        })
    }
    function deleteEvent(event) {
        dataContext.remove({
            className: 'Event',
            id: event.objectId()
        }).then(function () {
            events.remove(event);

            if (event.important()) {
                dataContext.correctImportantDays(false, event.date());
            }
        })
    }
    function reset() {
        eventToSave.name('New event');
        eventToSave.description('');
        eventToSave.important(false);
        eventToSave.date(selectedDate());
        eventToSave.subject(subject());
        eventToSave.hours('00');
        eventToSave.minutes('00');

        eventToEdit(undefined);
    }

    //--------------------------------------------------------- //
    function getEvents(queryConstraints) {
        return dataContext.getCollection({
            className: 'Event',
            queryConstraints: queryConstraints
        }).then(function (recivedEvents) {
            var observableEvents = [],
                number = recivedEvents.length,
                i;
            for (i = 0; i < number; i++) {
                observableEvents.push(new Event(recivedEvents[i]));
            }
            events(observableEvents);
        });
    }

    function activate(activationData) {
        var queryConstraints = {};

        if (activationData.subject) {
            subject(activationData.subject);
            selectedDate(today);
            queryConstraints.subject = subject();
        }
        if (activationData.date) {
            subject('');
            selectedDate(activationData.date());
            queryConstraints.date = selectedDate();

            dateSubscr = activationData.date.subscribe(function (newDate) {
                selectedDate(newDate);
                eventToSave.date(newDate);
                getEvents({ date: newDate });
            });
        }

        eventToSave.date(selectedDate());
        eventToSave.subject(subject());

        return getEvents(queryConstraints);
    }
    function detached() {
        if (dateSubscr) {
            dateSubscr.dispose();
        }
        selectedDate(undefined);
        subject(undefined);

        reset();
    }
});