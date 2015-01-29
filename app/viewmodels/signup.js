define(['durandal/app', 'knockout', 'plugins/router', 'userContext'], function (app, ko, router, userContext) {

    return {
        username: ko.observable(),
        password: ko.observable(),
        passwordConfirm: ko.observable(),

        submit: function () {
            if (this.password() === this.passwordConfirm()) {
                userContext.signup(this.username(), this.password())
                    .then(function () {
                        router.navigate('');
                    })
                    .catch(function () {
                        app.showMessage('This username is already taken!', '', ['OK'], true);
                    });
            } else {
                this.password('');
                this.passwordConfirm('');
            }
        },

        canActivate: function () {
            return userContext.session() ? { redirect: '' } : true;
        },
        deactivate: function () {
            this.username('');
            this.password('');
            this.passwordConfirm('');
        }
    }

})