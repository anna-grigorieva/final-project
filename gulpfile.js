var
    gulp = require('gulp'),
    durandal = require('gulp-durandal'),
    useref = require('gulp-useref'),
    minifyCss = require('gulp-minify-css'),
    replace = require('gulp-replace'),
    flatten = require('gulp-flatten');

gulp.task('html', function () {
    var
        assets = useref.assets(),
        oldScript = '<script src="lib/require.js" data-main="app/main"></script>',
        newScripts = '<script>window.CKEDITOR_BASEPATH = window.location.toString().substring(0, window.location.toString().indexOf("index.html")) + "lib/ckeditor/"</script>\n    ' +
                     '<script src="app/main.js" data-main="app/main"></script>';

    gulp.src('./index.html')
        .pipe(replace(oldScript, newScripts))
        .pipe(assets)
        .pipe(minifyCss())
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('__build'));
});

gulp.task('images', function () {
    gulp
        .src([
            './css/images/*.*',
            './lib/**/images/*.*',
            '!./lib/ckeditor/**/*.*'
        ])
        .pipe(flatten())
        .pipe(gulp.dest('__build/css/images'));
});

gulp.task('fonts', function () {
    gulp
        .src('./lib/**/fonts/*.*')
        .pipe(flatten())
        .pipe(gulp.dest('__build/fonts'));
});

gulp.task('ckeditor', function () {
    gulp
        .src([
            './lib/ckeditor/**/*.*',
            '!./lib/ckeditor/lang/en.js',
            '!./lib/ckeditor/adapters/jquery.js',
            '!./lib/ckeditor/ckeditor.js',
            '!./lib/ckeditor/build-config.js',
            '!./lib/ckeditor/styles.js'
        ])
        .pipe(gulp.dest('__build/lib/ckeditor'));
});

gulp.task('durandal', function () {
    return durandal({
        baseDir: 'app',
        main: 'main.js',
        output: 'main.js',
        almond: true,
        minify: false,
        extraModules: ['en', 'styles']
    }).pipe(gulp.dest('__build/app'));
});

gulp.task('default', ['html', 'images', 'fonts', 'ckeditor', 'durandal']);