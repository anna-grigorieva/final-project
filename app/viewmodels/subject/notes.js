define(['plugins/router', 'knockout', 'dataContext', 'userContext'], function (router, ko, dataContext, userContext) {
    var
        editor = ko.observable(),
        subject = ko.observable(),
        id = ko.observable(),
        title = ko.observable(),
        data = ko.observable(),
        isBusy = ko.observable(false);

    return {
        title: title,
        editor: editor,
        isBusy: isBusy,

        saveData: saveData,

        activate: activate,
        bindingComplete: bindingComplete
    };

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
    function bindingComplete() {
        editor().setData(data());
    }

    function saveData() {
        isBusy(true);

        return dataContext.update({
            className: 'Notes',
            id: id(),
            data: { subject: subject(), data: editor().getData() }
        }).then(function () {
            isBusy(false);
        });
    }
});