define(['knockout', 'plugins/router', 'userContext'], function (ko, router, userContext) {

    return {
        username: ko.observable(),
        password: ko.observable(),

        submit: function () {
            userContext.signin(this.username(), this.password())
                .then(function () {
                    router.navigate('');
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