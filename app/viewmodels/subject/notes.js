define(['plugins/router', 'knockout', 'ckeditor', 'dataContext', 'userContext'], function (router, ko, ckeditor, dataContext, userContext) {
    var
        editor,
        subject = ko.observable(),
        id = ko.observable(),
        title = ko.observable(),
        data = ko.observable();

    return {
        title: title,

        saveData: saveData,
        removeNotes: removeNotes,

        canActivate: function () {
            return userContext.session() ? true : { redirect: 'signin' };
        },
        activate: activate,
        attached: attached
    };

    function saveData() {
        dataContext.update({
            className: 'Notes',
            id: id(),
            data: { subject: subject(), data: editor.getData() }
        });
    }
    function removeNotes() {
        dataContext.remove({
            className: 'Notes',
            id: id()
        }).then(function () {
            router.navigate('#subjects/'+subject()+'/allnotes');
        });
    }
    function activate(subjectName, objectId) {
        subject(subjectName);
        id(objectId);

        return dataContext.getById({
            className: 'Notes',
            id: id()
        }).then(function (conspect) {
            data(conspect.data);
            title(conspect.title);
        });
    }
    function attached() {
        CKEDITOR.replace('editor');
        editor = CKEDITOR.instances.editor;
        editor.setData(data());
    }
});