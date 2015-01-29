define(['knockout', 'moment', 'dataContext', 'constructors/task', 'viewmodels/modals/editTask'], function (ko, moment, dataContext, Task, EditTaskModal) {
    var
        subject = ko.observable(),
        tasks = ko.observableArray(),
        importantTasks = ko.computed(function () { return filterTasks({ important: true }); }),
        unimportantTasks = ko.computed(function () { return filterTasks({ important: false }); }),
        selectedDate = ko.observable(),
        dateSubscr,
        isBusy = ko.observable(false);

    return {
        subject: subject,
        importantTasks: importantTasks,
        unimportantTasks: unimportantTasks,
        isBusy: isBusy,

        editTask: editTask,
        deleteTask: deleteTask,

        activate: activate,
        detached: detached
    };

    function activate(activationData) {
        var queryConstraints = {};

        if (activationData.subject) {
            subject(activationData.subject);
            selectedDate(moment({ h: 0, m: 0, s: 0, ms: 0 }));
            queryConstraints.subject = subject();
        }
        if (activationData.date) {
            subject('');
            selectedDate(activationData.date());
            queryConstraints.date = selectedDate();

            dateSubscr = activationData.date.subscribe(function (newDate) {
                isBusy(true);

                selectedDate(newDate);
                getTasks({ date: newDate }).then(function () {
                    isBusy(false);
                });
            });
        }

        return getTasks(queryConstraints);
    }
    function detached() {
        if (dateSubscr) {
            dateSubscr.dispose();
        }
        selectedDate(undefined);
        subject(undefined);
    }

    function editTask(oldTask) {
        if (!oldTask.objectId) {
            EditTaskModal.show(new Task({
                date: selectedDate(),
                subject: subject()
            })).then(function (createdTask) {
                if (createdTask) {
                    isBusy(true);

                    addTask(createdTask).then(function () {
                        isBusy(false);
                    });
                }
            });
        } else {
            EditTaskModal.show(oldTask)
                .then(function (updatedTask) {
                    if (updatedTask) {
                        isBusy(true);

                        updateTask(updatedTask, oldTask).then(function () {
                            isBusy(false);
                        });
                    }
                });
        }
    }
    function deleteTask(task) {
        isBusy(true);

        return dataContext.remove({
            className: 'Task',
            id: task.objectId()
        }).then(function () {
            tasks.remove(task);

            if (!subject() && task.important()) {
                dataContext.correctImportantDays(false, task.date());
            }
            isBusy(false);
        })
    }

    function getTasks(queryConstraints) {
        return dataContext.getCollection({
            className: 'Task',
            queryConstraints: queryConstraints
        }).then(function (recivedTasks) {
            var observableTasks = [],
                number = recivedTasks.length,
                i;
            for (i = 0; i < number; i++) {
                observableTasks.push(new Task(recivedTasks[i]));
            }
            tasks(observableTasks);
        });
    }
    function filterTasks(options) {
        var
            filteredTasks = ko.utils.arrayFilter(tasks(), function (task) {
                return options.important ? task.important() : !task.important();
            });

        return subject() ? filteredTasks.sort(function (first, second) { return first.date() - second.date(); })
            : filteredTasks;
    }
    function addTask(createdTask) {
        return dataContext.add({
            className: 'Task',
            data: createdTask
        }).then(function (objectId) {
            createdTask.objectId = objectId;
            tasks.push(new Task(createdTask));

            if (!subject() && createdTask.important) {
                dataContext.correctImportantDays(true, createdTask.date);
            }
            return objectId;
        })
    }
    function updateTask(updatedTask, oldTask) {
        return dataContext.update({
            className: 'Task',
            id: oldTask.objectId(),
            data: updatedTask
        }).then(function () {

            if (!subject()) {
                if (updatedTask.date.toString() != oldTask.date().toString()) {
                    dataContext.correctImportantDays(false, oldTask.date());
                    dataContext.correctImportantDays(updatedTask.important, updatedTask.date);

                    tasks.remove(oldTask);
                } else
                    if (updatedTask.important != oldTask.important()) {
                        dataContext.correctImportantDays(updatedTask.important, updatedTask.date);
                    }
            }

            for (var data in updatedTask) {
                oldTask[data](updatedTask[data]);
            }
        });
    }
});