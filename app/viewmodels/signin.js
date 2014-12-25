define(['knockout', 'plugins/router', 'userContext'], function (ko, router, userContext) {

    var vm = {
        email: ko.observable(),
        password: ko.observable(),
        submit: submit,

        canActivate: canActivate
    }

    return vm;

    function canActivate() {
        return userContext.session() ? { redirect: '' } : true;
    }

    function submit() {
        userContext.signin(vm.email(), vm.password())
            .then(function () {
                router.navigate('');
            });
    }

})