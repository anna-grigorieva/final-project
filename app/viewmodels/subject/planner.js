define(['userContext'], function (userContext) {
    return {

        /// TODO : 
        ///         1) check 'canActivate' on child routes
        ///         2) chacge 404-page on sub-shell
        ///         3) check 404-page when not signed-in
        ///         4) response from server on sign-in/sign-up

        activate: function (subjectName) {
            this.subject = subjectName;
        }
    };
});