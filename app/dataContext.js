define(['knockout', 'Q', 'plugins/http', 'moment', 'userContext'], function (ko, Q, http, moment, userContext) {
    var
        headers = {
            "X-Parse-Application-Id": "zbYY8JIWUi6nTHFQx4Uayesk4aUtK0hPIvVRpcGD",
            "X-Parse-REST-API-Key": "4kFIrm6AgCPTaciwt7frojWIFgiEjoCdxFWsiWMg"
        },
        importantDays = ko.observableArray();

    return {
        add: add,
        update: update,
        remove: remove,
        removeCollection: removeCollection,
        getCollection: getCollection,
        getById: getById,

        isDateImportant: isDateImportant,
        getImportantDays: getImportantDays,
        correctImportantDays: correctImportantDays,

        doesSubjectExist: doesSubjectExist
    }

    function add(options) {
        var
            dfd = Q.defer(),
            url = 'https://api.parse.com/1/classes/' + options.className,
            data = options.data || {},
            acl = {};

        if (userContext.userId()) {
            acl[userContext.userId()] = {
                "read": true,
                "write": true
            };
            data.ACL = acl;
        }

        http.post(url, data, headers)
            .done(function (response) {
                dfd.resolve(response.objectId, response.createdAt);
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
    function removeCollection(options) {
        var itemsToRemove = options.items || [];

        if (options.queryConstraints) {
            return getCollection(options).then(function (recievedItems) {
                itemsToRemove = recievedItems;
                return removeItems();
            });
        } else {
            return removeItems();
        }

        function removeItems() {
            return itemsToRemove.reduce(function (removeItem, item) {
                return removeItem.then(function () {
                    return remove({ className: options.className, id: item.objectId });
                });
            }, Q.resolve());
        }
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
                date: {
                    $gte: date,
                    $lt: moment(date).add(1, 'd')
                }
            }
        }).then(function (importantTasks) {
            if (!importantTasks.length) {
                return getCollection({
                    className: 'Event',
                    queryConstraints: {
                        important: true,
                        date: {
                            $gte: date,
                            $lt: moment(date).add(1, 'd')
                        }
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
            eventDate,
            i;

        return getCollection({
            className: 'Task',
            queryConstraints: {
                important: true,
                date: {
                    "$gte": firstDay,
                    "$lte": lastDay
                }
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
                    date: {
                        "$gte": firstDay,
                        "$lt": moment(lastDay).add(1, 'd')
                    }
                }
            })
        }).then(function (importantEvents) {
            for (i = 0; i < importantEvents.length; i++) {
                eventDate = moment(importantEvents[i].date).hours(0).minutes(0).seconds(0).milliseconds(0).toJSON();
                if (days.indexOf(eventDate) == -1) {
                    days.push(eventDate);
                }
            }
            importantDays(days);
            return importantDays;
        });
    }
    function correctImportantDays(itemImportant, date) {
        date = moment(date).hours(0).minutes(0).seconds(0).milliseconds(0).toJSON();
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

    function doesSubjectExist(subjectName) {
        return getCollection({ className: 'Subject' })
            .then(function (recievedSubjects) {
                for (var i = 0; i < recievedSubjects.length; i++) {
                    if (recievedSubjects[i].name == subjectName) {
                        return true;
                    }
                }
            });
    }
});