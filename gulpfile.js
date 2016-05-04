var gulp = require('gulp');
var wrap = require('gulp-wrap');
var handlebars = require('gulp-handlebars');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var watch = require('gulp-watch');
var eslint = require('gulp-eslint');

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

gulp.task('css', function() {
    return gulp.src('src/css/mobile/*')
        .pipe(postcss(
            [autoprefixer({browsers: ['> 2%']})]
        ))
        .pipe(gulp.dest('public/css/mobile/'));
});

gulp.task('watch', function() {
    watch('src/css/mobile/*', function() {
        gulp.start('css');
    });
});

gulp.task('eslint', function() {
    return gulp.src('src/**/*.js')
        .pipe(eslint({
            fix: true
        }))
        .pipe(eslint.format());
});
