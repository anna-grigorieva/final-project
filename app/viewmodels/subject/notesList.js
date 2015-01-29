define(['durandal/app', 'knockout', 'moment', 'dataContext', 'userContext', 'viewmodels/modals/newNotes'], function (app, ko, moment, dataContext, userContext, NewNotesModal) {
    var
        subject = ko.observable(),
        notesList = ko.observableArray(),
        isBusy = ko.observable(false);

    return {
        subject: subject,
        notesList: notesList,
        isBusy: isBusy,

        createNewNotes: createNewNotes,
        removeNotes: removeNotes,

        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        activate: activate
    };

    function activate(subjectName) {
        subject(subjectName);

        return dataContext.getCollection({
            className: 'Notes',
            queryConstraints: { subject: subject() }
        }).then(function (recievedNotes) {
            recievedNotes.sort(function (first, second) {
                return moment(second.updatedAt) - moment(first.updatedAt);
            });
            notesList(recievedNotes);
        });
    }

    function createNewNotes() {
        var newNotes;

        NewNotesModal.show()
            .then(function (title) {
                if (title) {
                    isBusy(true);

                    newNotes = {
                        title: title,
                        subject: subject(),
                        data: ''
                    };
                    dataContext.add({
                        className: 'Notes',
                        data: newNotes
                    }).then(function (id, createdAt) {
                        newNotes.objectId = id;
                        newNotes.updatedAt = createdAt;
                        notesList.unshift(newNotes);

                        isBusy(false);
                    });
                }
            });
    }
    function removeNotes(notes) {
        app.showMessage('Do you want to remove this notes?', '', ['No', 'Yes'], true)
            .then(function (dialogResult) {
                if (dialogResult == 'Yes') {
                    isBusy(true);

                    dataContext.remove({
                        className: 'Notes',
                        id: notes.objectId
                    }).then(function () {
                        notesList.remove(notes);

                        isBusy(false);
                    });
                } else {
                    return;
                }
            });
    }
});