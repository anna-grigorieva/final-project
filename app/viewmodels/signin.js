define(['durandal/app', 'knockout', 'plugins/router', 'userContext'], function (app, ko, router, userContext) {

    return {
        username: ko.observable(),
        password: ko.observable(),

        submit: function () {
            userContext.signin(this.username(), this.password())
                .then(function () {
                    router.navigate('');
                })
                .catch(function () {
                    app.showMessage('Wrong username or password!', '', ['OK'], true);
                });
        },

        canActivate: function () {
            return userContext.session() ? { redirect: '' } : true;
        },
        deactivate: function () {
            this.username('');
            this.password('');
        }
    }

})