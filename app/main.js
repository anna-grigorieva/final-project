require.config({
    paths: {
        'text': '../lib/text',
        'durandal': '../lib/durandal',
        'plugins': '../lib/durandal/plugins',
        'knockout': '../lib/knockout-3.1.0',
        'bootstrap': '../lib/bootstrap.min',
        'jquery': '../lib/jquery-1.9.1.min',
        'jqueryui': '../lib/jquery-ui.min',
        'ckeditor': '../lib/ckeditor/ckeditor',
        'moment': '../lib/moment.min',
        'Q': '../lib/q.min'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
        }
    }
});

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'bindingHandlers'], function (system, app, viewLocator, bindingHandlers) {
    //>>excludeStart("build", true)
    system.debug(true);
    //>>excludeEnd("build")

    app.title = 'Student Organizer';
    app.configurePlugins({
        router: true,
        dialog: true
    });
    app.start().then(function () {
        viewLocator.useConvention();
        app.setRoot('viewmodels/shell');
    });
});