var gulp = require('gulp');
var wrap = require('gulp-wrap');
var handlebars = require('gulp-handlebars');

var buildTpl = function() {
    return wrap("module.exports = require('handlebars').template(<%= contents %>)");
}
 
gulp.task('build', function() {
    gulp.src('src/templates/**/*.hbs')
        .pipe(handlebars({
            handlebars: require('handlebars')
        }))
        .pipe(buildTpl())
        .pipe(gulp.dest('src/templates/build/'));
});