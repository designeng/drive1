var gulp = require('gulp');
var extend = require('extend');
var wrap = require('gulp-wrap');
var handlebars = require('gulp-handlebars');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var watch = require('gulp-watch');
var eslint = require('gulp-eslint');
var closureCompiler = require('gulp-closure-compiler');
var closureDeps = require('gulp-closure-deps');

var buildTpl = function() {
    return wrap("module.exports = require('handlebars').template(<%= contents %>)");
};

var jsConfig = {
    src: [
        'js/_libs/closure-library/closure/goog/**/*.js',
        '!**/*_test.js',
        'js/_libs/bru/**/*.js',
        'js/_libs/sss.js',
        'js/_source/**/*.js'
    ],
    compiler: 'node_modules/google-closure-compiler/compiler.jar',
    flags: {
        charset: 'utf-8',
        compilation_level: 'ADVANCED',
        externs: [
            'js/_externs/plupload.js',
            'node_modules/google-closure-compiler/contrib/externs/maps/google_maps_api_v3_21.js'
        ],
        define: [
            'goog.LOCALE="ru-RU"',
            'goog.DEBUG=false',
            'goog.dom.ASSUME_STANDARDS_MODE=true',
            'goog.STRICT_MODE_COMPATIBLE=true',
            'goog.net.XmlHttp.ASSUME_NATIVE_XHR=true',
            'goog.net.XmlHttpDefines.ASSUME_NATIVE_XHR=true'
        ],
        only_closure_dependencies: true,
        use_types_for_optimization: true,
        jscomp_warning: 'missingProperties',
        jscomp_off: 'visibility',
        warning_level: 'VERBOSE',
        output_wrapper: '(function(){%output%}).call(window);'
    },
    main: {
        flags: {
            closure_entry_point: 'drive.all',
            output_wrapper: '%output%\n//# sourceMappingURL=core.js.map',
            create_source_map: 'js/core.js.map',
            source_map_format: 'V3'
        },
        output: 'core.js',
        dest: 'js'
    },
    admin: {
        flags: {
            closure_entry_point: 'driveadm.core'
        },
        output: 'admin.js',
        dest: 'admin/js'
    }
};

var depsConfig = {
    src: [
        'js/_libs/bru/**/*.js',
        'js/_source/**/*.js'
    ],
    prefix: '../../../..',
    base: 'js',
    dest: 'js/_source'
};

gulp.task('default', ['build']);

gulp.task('js', ['deps'], function() {
    var flags = extend(true, {}, jsConfig.flags, jsConfig.main.flags);
    return gulp.src(jsConfig.src)
        .pipe(closureCompiler({
            compilerPath: jsConfig.compiler,
            fileName: jsConfig.main.output,
            compilerFlags: flags
        }))
        .pipe(gulp.dest(jsConfig.main.dest));
});

gulp.task('deps', function() {
    return gulp.src(depsConfig.src)
        .pipe(closureDeps({
            prefix: depsConfig.prefix,
            baseDir: depsConfig.base
        }))
        .pipe(gulp.dest(depsConfig.dest));
});
 
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
        .pipe(eslint())
        .pipe(eslint.format());
});
