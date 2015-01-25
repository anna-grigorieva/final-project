define(['knockout', 'moment', 'dataContext', 'constructors/event', 'viewmodels/modals/editEvent'], function (ko, moment, dataContext, Event, EditEventModal) {
    var
        events = ko.observableArray(),
        sortedEvents = ko.computed(function () {
            events.sort(function (first, second) {
                return first.date() - second.date();
            });
            return events();
        }),
        subject = ko.observable(),
        selectedDate = ko.observable(),
        dateSubscr,
        isBusy = ko.observable(false);

    return {
        subject: subject,
        sortedEvents: sortedEvents,
        isBusy: isBusy,

        editEvent: editEvent,
        deleteEvent: deleteEvent,

        activate: activate,
        detached: detached
    };

    function activate(activationData) {
        var queryConstraints = {};

        if (activationData.subject) {
            subject(activationData.subject);
            selectedDate(moment({ h: 0, m: 0, s: 0, ms: 0 }));
            queryConstraints.subject = subject();
        }
        if (activationData.date) {
            subject('');
            selectedDate(activationData.date());
            queryConstraints.date = {
                $gte: selectedDate(),
                $lt: moment(selectedDate()).add(1, 'd')
            };

            dateSubscr = activationData.date.subscribe(function (newDate) {
                isBusy(true);

                selectedDate(newDate);
                getEvents({
                    date: {
                        $gte: newDate,
                        $lt: moment(newDate).add(1, 'd')
                    }
                }).then(function () {
                    isBusy(false);
                });
            });
        }

        return getEvents(queryConstraints);
    }
    function detached() {
        if (dateSubscr) {
            dateSubscr.dispose();
        }
        selectedDate(undefined);
        subject(undefined);
    }

    function editEvent(oldEvent) {
        if (!oldEvent.objectId) {
            EditEventModal.show(new Event({
                date: selectedDate(),
                subject: subject()
            })).then(function (createdEvent) {
                if (createdEvent) {
                    isBusy(true);

                    addEvent(createdEvent).then(function () {
                        isBusy(false);
                    });
                }                
            });
        } else {
            EditEventModal.show(oldEvent)
                .then(function (updatedEvent) {
                    if (updatedEvent) {
                        isBusy(true);

                        updateEvent(updatedEvent, oldEvent).then(function () {
                            isBusy(false);
                        });
                    }
                });
        }
    }
    function deleteEvent(event) {
        isBusy(true);

        return dataContext.remove({
            className: 'Event',
            id: event.objectId()
        }).then(function () {
            events.remove(event);

            if (event.important()) {
                dataContext.correctImportantDays(false, event.date());
            }
            isBusy(false);
        })
    }

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
            observableEvents.sort(function (first, second) {
                return first.date() - second.date();
            });
            events(observableEvents);
        });
    }
    function addEvent(createdEvent) {
        return dataContext.add({
            className: 'Event',
            data: createdEvent
        }).then(function (objectId) {
            createdEvent.objectId = objectId;
            events.push(new Event(createdEvent));

            if (!subject() && createdEvent.important) {
                dataContext.correctImportantDays(true, createdEvent.date);
            }
            return objectId;
        })
    }
    function updateEvent(updatedEvent, oldEvent) {
        return dataContext.update({
            className: 'Event',
            id: oldEvent.objectId(),
            data: updatedEvent
        }).then(function () {

            if (!subject()) {
                if (updatedEvent.date.format('MM/DD/YYYY') !== oldEvent.date().format('MM/DD/YYYY')) {
                    dataContext.correctImportantDays(false, oldEvent.date());
                    dataContext.correctImportantDays(updatedEvent.important, updatedEvent.date);

                    events.remove(oldEvent);
                } else
                    if (updatedEvent.important != oldEvent.important()) {
                        dataContext.correctImportantDays(updatedEvent.important, updatedEvent.date);
                    }
            }

            for (var data in updatedEvent) {
                oldEvent[data](updatedEvent[data]);
            }
        });
    }
});