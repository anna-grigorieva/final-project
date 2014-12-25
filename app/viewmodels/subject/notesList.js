define(['plugins/router', 'knockout', 'dataContext', 'userContext', 'viewmodels/modals/newNotes'], function (router, ko, dataContext, userContext, NewNotesModal) {
    var
        subject = ko.observable(),
        notesList = ko.observableArray();

    return {
        subject: subject,
        notesList: notesList,
        createNewNotes: createNewNotes,

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
            notesList(recievedNotes);
        });
    }
    function createNewNotes() {
        NewNotesModal.show()
            .then(function (title) {
                if (title) {
                    dataContext.add({
                        className: 'Notes',
                        data: {
                            title: title,
                            subject: subject(),
                            data: ''
                        }
                    }).then(function (objectId) {
                        router.navigate('subjects/' + subject() + '/notes/' + objectId);
                    });
                }
            });
    }
});