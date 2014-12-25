define(['Q', 'plugins/http', 'knockout'], function (Q, http, ko) {
    var
        headers = {
            "X-Parse-Application-Id": "zbYY8JIWUi6nTHFQx4Uayesk4aUtK0hPIvVRpcGD",
            "X-Parse-REST-API-Key": "4kFIrm6AgCPTaciwt7frojWIFgiEjoCdxFWsiWMg"
        },
        userContext = {
            signin: signin,
            signup: signup,
            logOut: logOut,

            sessionTokenKey: 'LOCST_SESSION_TOKEN_KEY',
            userIdKey: 'LOCST_USER_ID_KEY',
            sessionToken: sessionToken,
            userId: userId,
            userLoggedIn: ko.observable(false),
            session: session
        }

    return userContext;

    function session() {
        if (userContext.sessionToken() && userContext.userId()) {
            userContext.userLoggedIn(true);
            return true;
        }
        return false;
    }
    function sessionToken() {
        return localStorage.getItem(userContext.sessionTokenKey);
    }
    function userId() {
        return localStorage.getItem(userContext.userIdKey);
    }
    function signup(fullname, email, password) {
        var dfd = Q.defer();

        var url = 'https://api.parse.com/1/users/';

        var user = {
            fullname: fullname,
            username: email,
            password: password
        };

        http.post(url, user, headers)
            .done(function () {
                dfd.resolve();
            })
            .fail(function () {
                dfd.reject();
            });

        return dfd.promise;
    }
    function signin(email, password) {
        var dfd = Q.defer();

        var url = 'https://api.parse.com/1/login/';

        var user = {
            username: email,
            password: password
        };

        http.get(url, user, headers)
            .done(function (response) {
                if (response) {
                    localStorage.setItem(userContext.sessionTokenKey, response.sessionToken);
                    localStorage.setItem(userContext.userIdKey, response.objectId);
                    userContext.userLoggedIn(true);
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
        localStorage.removeItem(userContext.sessionTokenKey);
        localStorage.removeItem(userContext.userIdKey);
        userContext.userLoggedIn(false);
    }
});