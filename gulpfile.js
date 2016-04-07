var gulp = require('gulp');
var wrap = require('gulp-wrap');
var handlebars = require('gulp-handlebars');
var jscs = require('gulp-jscs');
var stylish = require('gulp-jscs-stylish');

var buildTpl = function() {
    return wrap("module.exports = require('handlebars').template(<%= contents %>)");
};

gulp.task('default', ['build', 'jscs']);
 
gulp.task('build', function() {
    return gulp.src('src/templates/**/*.hbs')
        .pipe(handlebars({
            handlebars: require('handlebars')
        }))
        .pipe(buildTpl())
        .pipe(gulp.dest('src/templates/build/'));
});

gulp.task('jscs', function() {
    return gulp.src('src/**/*.js')
        .pipe(jscs())
        .pipe(stylish());
});