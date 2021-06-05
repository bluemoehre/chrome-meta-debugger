const gulp = require('gulp')
const sass = require('gulp-sass')

const scssEntryPoints = ['./src/scss/@(panel-meta|popup).scss']
const scssWatchFiles = ['./src/scss/**/*.scss']
const cssDestination = './src/css/'

function compileCss() {
  return gulp
    .src(scssEntryPoints)
    .pipe(sass())
    .on('error', function (err) {
      console.error(err.message)
      this.emit('end') // prevent abort of watch process
    })
    .pipe(gulp.dest(cssDestination))
}

function watch() {
  gulp.watch(scssWatchFiles, compileCss)
}

exports.compileCss = compileCss
exports.watch = watch
