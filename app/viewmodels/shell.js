define(['durandal/app', 'plugins/router', 'knockout', 'dataContext', 'userContext', 'bootstrap'], function (app, router, ko, dataContext, userContext) {
    var
        newSubject = ko.observable(),
        isBusy = ko.observable(false),
        removingSubjectData = ko.observable(false),
        subjects = ko.observableArray();

    return {
        newSubject: newSubject,
        subjects: subjects,
        userName: userContext.userName,
        isBusy: isBusy,
        removingSubjectData: removingSubjectData,
        
        refreshSubjects: refreshSubjects,
        addNewSubject: addNewSubject,
        removeSubject: removeSubject,
        logOut: logOut,

        router: router,
        canActivate: function () { return userContext.session() ? true : { redirect: 'signin' }; },
        activate: function () {
            router.map([
                { route: ['', 'organizer'], title: 'Organizer', moduleId: 'viewmodels/organizer', icon: 'tasks', nav: true },
                { route: 'schedule', title: 'Schedule', moduleId: 'viewmodels/schedule', icon: 'calendar', nav: true },
                { route: 'subjects/:name*sections', title: 'Subjects', moduleId: 'viewmodels/subject/shell', hash: '#subjects/:name', icon: 'book', nav: false },

                { route: 'signin', title: 'Sign in', moduleId: 'viewmodels/signin', nav: false },
                { route: 'signup', title: 'Sign up', moduleId: 'viewmodels/signup', nav: false },
                { route: '404', title: 'Page not found', moduleId: 'viewmodels/404', nav: false }
            ]).buildNavigationModel()
              .mapUnknownRoutes('viewmodels/404', 'not-found');

            return router.activate();
        }
    };

    function refreshSubjects() {
        subjects([]);
        isBusy(true);

        dataContext.getCollection({ className: 'Subject' })
            .then(function (recievedSubjects) {
                subjects(recievedSubjects);
                subjects.sort(function (a, b) { return a.name.localeCompare(b.name); });

                isBusy(false);
            });
    }
    function addNewSubject() {
        return dataContext.add({
            className: 'Subject',
            data: { name: newSubject() }
        }).then(function (objectId) {
            router.navigate('subjects/' + newSubject());
            subjects.push({ name: newSubject(), objectId: objectId });
            subjects.sort(function (a, b) { return a.name.localeCompare(b.name); });
            newSubject('');
        });
    }
    function removeSubject(subject) {
        app.showMessage('Do you want to remove this subject and all related data?', '', ['No', 'Yes'], true)
            .then(function (dialogResult) {
                if (dialogResult == 'Yes') {
                    var
                        currantRoute = router.activeInstruction().fragment,
                        redirectNeeded = (currantRoute === 'subjects/' + subject.name ||
                                         ~currantRoute.indexOf('subjects/' + subject.name + '/'));
                    
                    return dataContext.remove({
                        className: 'Subject',
                        id: subject.objectId
                    }).then(function () {
                        removingSubjectData(true);
                        return dataContext.removeCollection({ className: 'Task', queryConstraints: { subject: subject.name } });
                    }).then(function () {
                        return dataContext.removeCollection({ className: 'Event', queryConstraints: { subject: subject.name } });
                    }).then(function () {
                        return dataContext.removeCollection({ className: 'Notes', queryConstraints: { subject: subject.name } });
                    }).then(function () {
                        return dataContext.removeCollection({ className: 'Flashcards', queryConstraints: { deck: subject.name } });
                    }).then(function () {
                        subjects.remove(subject);

                        if (redirectNeeded) {
                            removingSubjectData(false);
                            router.navigate('');
                        }
                    });
                } else {
                    return;
                }
            });
    }
    function logOut() {
        app.showMessage('Do you want to log out?', '', ['No', 'Yes'], true)
            .then(function (dialogResult) {
                if (dialogResult == 'Yes') {
                    router.navigate('signin');
                    userContext.logOut();
                } else {
                    return;
                }
            });
    }
});