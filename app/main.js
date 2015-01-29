require.config({
    paths: {
        'text': '../lib/text',
        'durandal': '../lib/durandal',
        'plugins': '../lib/durandal/plugins',
        'knockout': '../lib/knockout-3.1.0',
        'bootstrap': '../lib/bootstrap/bootstrap.min',
        'jquery': '../lib/jquery-2.1.1.min',
        'jqueryui': '../lib/jquery-ui/jquery-ui.min',
        'Q': '../lib/q.min',
        'moment': '../lib/moment.min',
        'ckeditor': '../lib/ckeditor/ckeditor',
        'en': '../lib/ckeditor/lang/en',
        'styles': '../lib/ckeditor/styles'
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