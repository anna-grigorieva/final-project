define(['userContext'], function (userContext) {
    return {
        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        activate: function (subjectName) {
            this.subject = subjectName;
        }
    };
});