define(['plugins/router', 'durandal/app', 'knockout', 'dataContext', 'userContext'], function (router, app, ko, dataContext, userContext) {
    var subject = ko.observable(),

        childRouter = router.createChildRouter()
        .makeRelative({
            moduleId: 'viewmodels/subject',
            fromParent: true,
            dynamicHash: ':name'
        })
        .map([
            { route: ['', 'tasks'], moduleId: 'tasks', title: 'Tasks', nav: true },
            { route: 'events', moduleId: 'events', title: 'Events', nav: true },
            { route: 'allnotes', moduleId: 'notesList', title: 'Notes', nav: true },
            { route: 'notes/:id', moduleId: 'notes', title: 'Notes', nav: false },
            { route: 'flashcards', moduleId: 'flashcards', title: 'Flashcards', nav: true },
            { route: 'editcards', moduleId: 'editcards', title: 'Edit cards', nav: false }
        ]).buildNavigationModel()
          .mapUnknownRoutes('../../viewmodels/404', 'not-found');

    return {
        router: childRouter,
        subject: subject,

        deleteSubject: deleteSubject,

        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        activate: activate
    };

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
    function activate(subjectName) {
        subject(subjectName);
    }
});