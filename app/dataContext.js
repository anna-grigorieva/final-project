define(['knockout', 'Q', 'plugins/http', 'moment', 'userContext'], function (ko, Q, http, moment, userContext) {
    var
        headers = {
            "X-Parse-Application-Id": "zbYY8JIWUi6nTHFQx4Uayesk4aUtK0hPIvVRpcGD",
            "X-Parse-REST-API-Key": "4kFIrm6AgCPTaciwt7frojWIFgiEjoCdxFWsiWMg"
        },
        importantDays = ko.observableArray(),
        subjects = ko.observableArray();

    return {
        add: add,
        update: update,
        remove: remove,
        getCollection: getCollection,
        getById: getById,

        isDateImportant: isDateImportant,
        getImportantDays: getImportantDays,
        correctImportantDays: correctImportantDays,

        subjects: subjects,
        getSubjects: getSubjects,
        removeSubject: removeSubject
    }

    function add(options) {
        var
            dfd = Q.defer(),
            url = 'https://api.parse.com/1/classes/' + options.className,
            data = options.data;

        if (userContext.userId()) {
            var acl = {};
            acl[userContext.userId()] = {
                "read": true,
                "write": true
            };
            data.ACL = acl;
        }

        http.post(url, data, headers)
            .done(function (response) {
                dfd.resolve(response.objectId);
            })
            .fail(function () {
                dfd.reject();
            });

        return dfd.promise;
    }
    function update(options) {
        var
            dfd = Q.defer(),
            url = 'https://api.parse.com/1/classes/' + options.className + '/' + options.id,
            updatedData = options.data;

        http.put(url, updatedData, headers)
            .done(function () {
                dfd.resolve();
            })
            .fail(function () {
                dfd.reject();
            });

        return dfd.promise;
    }
    function remove(options) {
        var
            dfd = Q.defer(),
            url = 'https://api.parse.com/1/classes/' + options.className + '/' + options.id;

        http.remove(url, {}, headers)
            .done(function () {
                dfd.resolve();
            })
            .fail(function () {
                dfd.reject();
            });

        return dfd.promise;
    }
    function getCollection(options) {
        var
            dfd = Q.defer(),
            url = 'https://api.parse.com/1/classes/' + options.className + '/',
            query = options.queryConstraints ? { "where": JSON.stringify(options.queryConstraints) } : {};

        if (userContext.sessionToken()) {
            headers["X-Parse-Session-Token"] = userContext.sessionToken();
        }

        http.get(url, query, headers)
            .done(function (response) {
                if (response) {
                    dfd.resolve(response.results || []);
                } else {
                    dfd.reject();
                }
            })
            .fail(function () {
                dfd.reject();
            });

        return dfd.promise;
    }
    function getById(options) {
        var
            dfd = Q.defer(),
            url = 'https://api.parse.com/1/classes/' + options.className + '/' + options.id;

        if (userContext.sessionToken()) {
            headers["X-Parse-Session-Token"] = userContext.sessionToken();
        }

        http.get(url, {}, headers)
            .done(function (response) {
                if (response) {
                    dfd.resolve(response);
                } else {
                    dfd.reject();
                }
            })
            .fail(function () {
                dfd.reject();
            });

        return dfd.promise;
    }

    function isDateImportant(date) {
        return getCollection({
            className: 'Task',
            queryConstraints: {
                important: true,
                date: date
            }
        }).then(function (importantTasks) {
            if (!importantTasks.length) {
                return getCollection({
                    className: 'Event',
                    queryConstraints: {
                        important: true,
                        date: date
                    }
                }).then(function (importantEvents) {
                    if (!importantEvents.length) {
                        return false;
                    }
                });
            }
            return true;
        });
    }
    function getImportantDays(newDate) {
        var
            firstDay = moment([newDate.year(), newDate.month(), 1]),
            lastDay = moment([newDate.year(), 0, 31]).month(newDate.month()),
            days = [],
            i;

        return getCollection({
            className: 'Task',
            queryConstraints: {
                important: true,
                date: { "$gte": firstDay, "$lte": lastDay }
            }
        }).then(function (importantTasks) {
            for (i = 0; i < importantTasks.length; i++) {
                if (days.indexOf(importantTasks[i].date) == -1) {
                    days.push(importantTasks[i].date);
                }
            }
            return getCollection({
                className: 'Event',
                queryConstraints: {
                    important: true,
                    date: { "$gte": firstDay, "$lte": lastDay }
                }
            })
        }).then(function (importantEvents) {
            for (i = 0; i < importantEvents.length; i++) {
                if (days.indexOf(importantEvents[i].date) == -1) {
                    days.push(importantEvents[i].date);
                }
            }
            importantDays(days);
            return importantDays;
        });
    }
    function correctImportantDays(itemImportant, date) {
        date = date.toJSON();
        if (itemImportant) {
            if (importantDays.indexOf(date) == -1) {
                importantDays.push(date);
            }
        } else {
            isDateImportant(date)
                .then(function (response) {
                    if (!response) {
                        importantDays.remove(date);
                    }
                });
        }
    }

    function getSubjects() {
        return getCollection({ className: 'Subject' })
            .then(function (recievedSubjects) {
                var
                    subsNames = [],
                    len = recievedSubjects.length,
                    name,
                    i;

                for (i = 0; i < len; i++) {
                    subjects.push({ name: recievedSubjects[i].name, id: recievedSubjects[i].objectId });
                }
                return subjects;
            });
    }
    function removeSubject(subjectName) {
        var id, i;
        for (i = 0; i < subjects().length; i++) {
            if (subjects()[i].name == subjectName) {
                id = subjects()[i].id;
                subjects.remove(subjects()[i]);
                return remove({
                    className: 'Subject',
                    id: id
                });
            }
        }
    }


    //---------------------------------------------------------//
    function uploadFile(data) {
        var
            dfd = Q.defer(),
            url = 'https://api.parse.com/1/files/conspect.html',
            headers = {
                "X-Parse-Application-Id": "zbYY8JIWUi6nTHFQx4Uayesk4aUtK0hPIvVRpcGD",
                "X-Parse-REST-API-Key": "4kFIrm6AgCPTaciwt7frojWIFgiEjoCdxFWsiWMg",
                "Content-Type": "text/html"
            };

        http.post(url, data, headers)
            .done(function (response) {
                dfd.resolve(response);
            })
            .fail(function () {
                dfd.reject();
            });

        return dfd.promise;
    }
})