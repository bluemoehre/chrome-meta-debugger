// ----- generic requirements -----



// ----- gulp dependencies -----

var gulp         = require('gulp');
var less         = require('gulp-less');


// ----- config -----

var lessMainFiles = [
    './src/less/@(panel-meta|popup).less'
];
var lessWatchFiles = [
    './src/less/**/*.less'
];
var cssDestination = 'src/css/';


// ----- tasks -----

gulp.task('compileLess', function () {
    return gulp.src(lessMainFiles)
        .pipe(less()).on('error', function (err) {
            console.error(err.message);
            this.emit('end'); // prevent abort of watch process
        })
        .pipe(gulp.dest(cssDestination));
});

gulp.task('watch', ['compileLess'], function () {
    gulp.watch(lessWatchFiles, ['compileLess']);
});