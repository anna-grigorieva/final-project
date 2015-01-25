define(['Q', 'plugins/http', 'knockout'], function (Q, http, ko) {
    var
        headers = {
            "X-Parse-Application-Id": "zbYY8JIWUi6nTHFQx4Uayesk4aUtK0hPIvVRpcGD",
            "X-Parse-REST-API-Key": "4kFIrm6AgCPTaciwt7frojWIFgiEjoCdxFWsiWMg"
        },
        userName = ko.observable(''),
        sessionToken = function () { return localStorage.getItem('LOCST_SESSION_TOKEN_KEY'); },
        userId = function () { return localStorage.getItem('LOCST_USER_ID_KEY'); },
        session = function () {
            if (sessionToken() && userId()) {
                userName(localStorage.getItem('LOCST_USER_NAME_KEY') || '');
                return true;
            } else {
                userName('');
                return false;
            }
        };

    return {
        session: session,
        sessionToken: sessionToken,
        userId: userId,
        userName: userName,

        signup: signup,
        signin: signin,
        logOut: logOut
    };

    function signup(username, password) {
        var
            dfd = Q.defer(),
            url = 'https://api.parse.com/1/users/',
            userData = {
                username: username,
                password: password
            };

        http.post(url, userData, headers)
            .done(function () {
                signin(username, password).then(function () {
                    dfd.resolve();
                });
            })
            .fail(function () {
                dfd.reject();
            });

        return dfd.promise;
    }
    function signin(username, password) {
        var
            dfd = Q.defer(),
            url = 'https://api.parse.com/1/login/',
            userData = {
                username: username,
                password: password
            };

        http.get(url, userData, headers)
            .done(function (response) {
                if (response) {
                    localStorage.setItem('LOCST_SESSION_TOKEN_KEY', response.sessionToken);
                    localStorage.setItem('LOCST_USER_ID_KEY', response.objectId);
                    localStorage.setItem('LOCST_USER_NAME_KEY', username);
                    userName(username);

                    dfd.resolve();
                } else {
                    dfd.reject();
                }
            })
            .fail(function () {
                dfd.reject();
            });

        return dfd.promise;
    }
    function logOut() {
        localStorage.removeItem('LOCST_SESSION_TOKEN_KEY');
        localStorage.removeItem('LOCST_USER_ID_KEY');
        localStorage.removeItem('LOCST_USER_NAME_KEY');
        userName('');
    }
});