define(['knockout', 'moment', 'dataContext', 'constructors/task'], function (ko, moment, dataContext, Task) {
    var
        today = moment({ h: 0, m: 0, s: 0, ms: 0 }),
        selectedDate = ko.observable(),
        dateSubscr,
        subject = ko.observable(),

        tasks = ko.observableArray(),
        taskToEdit = ko.observable(),
        taskToSave = {
            title: ko.observable('New task'),
            description: ko.observable(''),
            important: ko.observable(false),
            date: ko.observable(selectedDate()),
            subject: ko.observable()
        };

    return {
        subject: subject,

        tasks: tasks,
        taskToEdit: taskToEdit,
        taskToSave: taskToSave,

        startEditingTask: startEditingTask,
        updateTask: updateTask,
        addTask: addTask,
        deleteTask: deleteTask,
        reset: reset,

        activate: activate,
        detached: detached
    };

    function startEditingTask(task) {
        taskToSave.title(task.title());
        taskToSave.description(task.description());
        taskToSave.date(task.date());
        taskToSave.important(task.important());
        taskToSave.subject(task.subject());

        taskToEdit(task);
    }
    function updateTask() {
        var
            updatedTask = {
                title: taskToSave.title(),
                description: taskToSave.description(),
                date: moment(taskToSave.date()),
                important: taskToSave.important(),
                subject: taskToSave.subject()
            };

        return dataContext.update({
            className: 'Task',
            id: taskToEdit().objectId(),
            data: updatedTask
        }).then(function () {
                        
            if (updatedTask.date.toString() != taskToEdit().date().toString()) {
                dataContext.correctImportantDays(false, taskToEdit().date());
                dataContext.correctImportantDays(updatedTask.important, updatedTask.date);

                tasks.remove(taskToEdit());
            } else
                if (updatedTask.important != taskToEdit().important()) {
                    dataContext.correctImportantDays(updatedTask.important, updatedTask.date);
                }

            for (data in updatedTask) {
                taskToEdit()[data](updatedTask[data]);
            }

            reset();
        })
    }
    function addTask() {
        var
            createdTask = {
                title: taskToSave.title(),
                description: taskToSave.description(),
                date: moment(taskToSave.date()),
                important: taskToSave.important(),
                subject: taskToSave.subject()
            };

        return dataContext.add({
            className: 'Task',
            data: createdTask
        }).then(function (objectId) {
            createdTask.objectId = objectId;
            tasks.push(new Task(createdTask));

            if (createdTask.important) {
                dataContext.correctImportantDays(true, createdTask.date);
            }

            reset();
            return objectId;
        })
    }
    function deleteTask(task) {
        dataContext.remove({
            className: 'Task',
            id: task.objectId()
        }).then(function () {
            tasks.remove(task);

            if (task.important()) {
                dataContext.correctImportantDays(false, task.date());
            }
        })
    }
    function reset() {
        taskToSave.title('New task');
        taskToSave.description('');
        taskToSave.important(false);
        taskToSave.date(selectedDate());
        taskToSave.subject(subject());

        taskToEdit(undefined);
    }

    //--------------------------------------------------------- //
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

    function activate(activationData) {
        var queryConstraints = {};

        if (activationData.subject) {
            subject(activationData.subject);
            selectedDate(today);
            queryConstraints.subject = subject();
        }
        if (activationData.date) {
            subject('');
            selectedDate(activationData.date());
            queryConstraints.date = selectedDate();

            dateSubscr = activationData.date.subscribe(function (newDate) {
                selectedDate(newDate);
                taskToSave.date(newDate);
                getTasks({ date: newDate });
            });
        }

        taskToSave.date(selectedDate());
        taskToSave.subject(subject());

        return getTasks(queryConstraints);
    }
    function detached() {
        if (dateSubscr) {
            dateSubscr.dispose();
        }
        selectedDate(undefined);
        subject(undefined);

        reset();
    }
});