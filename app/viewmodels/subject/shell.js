define(['plugins/router', 'durandal/app', 'knockout', 'dataContext', 'userContext'], function (router, app, ko, dataContext, userContext) {
    var subject = ko.observable(),

        childRouter = router.createChildRouter()
        .makeRelative({
            moduleId: 'viewmodels/subject',
            fromParent: true,
            dynamicHash: ':name'
        })
        .map([
            { route: ['', 'planner'], moduleId: 'planner', title: 'Planner', nav: true },
            { route: 'allnotes', moduleId: 'notesList', title: 'Notes', nav: true },
            { route: 'notes/:id', moduleId: 'notes', title: 'Notes', nav: false },
            { route: 'flashcards', moduleId: 'flashcards', title: 'Flashcards', nav: true },
            { route: 'deck', moduleId: 'deck', title: 'Deck', nav: false }
        ]).buildNavigationModel()
          .mapUnknownRoutes('../../viewmodels/404', 'subject/not-found');

    return {
        router: childRouter,
        subject: subject,

        deleteSubject: deleteSubject,

        canActivate: canActivate
    };

    function canActivate(subjectName) {
        if (userContext.session()) {
            return dataContext.doesSubjectExist(subjectName)
                .then(function (exists) {
                    if (exists) {
                        subject(subjectName);
                        return true;
                    }
                    return { redirect: '404' };
                });
        } else {
            return { redirect: 'signin' };
        }
    }

    function deleteSubject() {
        app.showMessage('Do you want to remove this subject?', '', ['No', 'Yes'], true)
            .then(function (dialogResult) {
                if (dialogResult == 'Yes') {
                    dataContext.removeSubject(subject())
                        .then(function () {
                            router.navigate('');
                        });
                } else {
                    return;
                }
            });
    }
});