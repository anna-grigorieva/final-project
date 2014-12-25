define(['plugins/router', 'dataContext', 'userContext', 'durandal/app', 'viewmodels/modals/newSubject', 'bootstrap'], function (router, dataContext, userContext, app, NewSubjectModal) {
    var vm = {
        router: router,

        showModalDialog: showModalDialog,
        logOut: logOut,
        userLoggedIn: userContext.userLoggedIn,

        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        activate: activate
    };

    return vm;

    function activate() {
        router.map([
            { route: ['', 'planner'], title: 'Planner', moduleId: 'viewmodels/planner', icon: 'pencil', nav: true },
            { route: 'schedule', title: 'Schedule', moduleId: 'viewmodels/schedule', icon: 'calendar', nav: true },
            { route: 'subjects/:name*sections', title: 'Subjects', moduleId: 'viewmodels/subject/shell', hash: '#subjects/:name', icon: 'book', nav: false },

            { route: 'signin', title: 'Sign in', moduleId: 'viewmodels/signin', nav: false },
            { route: 'signup', title: 'Sign up', moduleId: 'viewmodels/signup', nav: false },
            { route: '404', title: '404', moduleId: 'viewmodels/404', nav: false }
        ]).buildNavigationModel()
          .mapUnknownRoutes('viewmodels/404', 'not-found');

        return dataContext.getSubjects()
            .then(function (subjects) {
                vm.subjects = subjects;
                router.activate();
            })
    }
    function showModalDialog() {
        NewSubjectModal.show()
            .then(function (subjectName) {
                if (subjectName) {
                    dataContext.add({
                        className: 'Subject',
                        data: { name: subjectName }
                    }).then(function (objectId) {
                        dataContext.subjects.push({
                            name: subjectName,
                            id: objectId
                        });
                        router.navigate('subjects/' + subjectName);
                    });
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