const { src, dest, watch, series, task } = require('gulp'),
	gulpsass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	babel = require('gulp-babel'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	autoprefixer = require('gulp-autoprefixer'),
	cssnano = require('cssnano'),
	postcss = require('gulp-postcss'),
	rtlcss = require('gulp-rtlcss'),
	fileinclude = require('gulp-file-include'),
	clean = require('gulp-clean'),
	gwatch = require('gulp-watch'),
	cleanDest = require('gulp-clean-dest'),
	deleteEmpty = require('delete-empty'),
	critical = require('critical').stream,
	browsersync = require('browser-sync').create();

var paths = {
		source: 'src',
		destination: 'build'
	};

// create dist
function createDist() {
	return src([
		paths.source + '/**/*.*',
		'!' + paths.source + '/*.html',
		'!' + paths.source + '/include/**',
		'!' + paths.source + '/assets/scss/**',
		'!' + paths.source + '/assets/scripts/**'
	])
	.pipe(dest(paths.destination));
}

// compile scss into css
function sassToCss() {
	return src([
		paths.source + '/assets/scss/style.scss'
	])
	.pipe(sourcemaps.init())
	.pipe(gulpsass({includePaths:['./node_modules/']}).on('error', gulpsass.logError))
	.pipe(autoprefixer({
		overrideBrowserslist: ['last 20 versions']
	}))
	.pipe(dest(paths.destination + '/assets/css'))
	.pipe(postcss([cssnano()]))
	.pipe(autoprefixer({
		overrideBrowserslist: ['last 20 versions']
	}))
	.pipe(rename('style.min.css'))
	.pipe(sourcemaps.write('.'))
	.pipe(dest(paths.destination + '/assets/css'))
	.pipe(browsersync.stream());
}

// css to rtl-css
function rtlCss(){
    return src([
		paths.source + '/assets/scss/style.scss'
	])
	.pipe(sourcemaps.init())
	.pipe(gulpsass({ includePaths: ['./node_modules/'] }).on('error', gulpsass.logError))
	.pipe(autoprefixer({
		overrideBrowserslist: ['last 20 versions']
	}))
	.pipe(rename('style-rtl.css'))
	.pipe(rtlcss())
	.pipe(dest(paths.destination + '/assets/css'))
	.pipe(postcss([cssnano()]))
	.pipe(autoprefixer({
		overrideBrowserslist: ['last 20 versions']
	}))
	.pipe(rename('style-rtl.min.css'))
	.pipe(sourcemaps.write('.'))
	.pipe(dest(paths.destination + '/assets/css'))
	.pipe(browsersync.stream());
}

// minify js
function vendorJs() {
	return src([
		paths.source + '/assets/scripts/jquery.js',
		paths.source + '/assets/scripts/vendors/*.js',
	])
	.pipe(sourcemaps.init())
	.pipe(concat(paths.destination + '/assets/js/vendors.js'))
	.pipe(dest('.'))
	.pipe(rename('vendors.min.js'))
	.pipe(uglify())
	.pipe(sourcemaps.write('.'))
	.pipe(dest(paths.destination + '/assets/js'))
	.pipe(browsersync.stream());
}

// minify js
function minifyJs() {
	return src([
		paths.source + '/assets/scripts/main.js'
	])
	.pipe(sourcemaps.init())
	.pipe(babel({
		"presets": [
			["env", { "modules": false }]
		]
	}))
	.pipe(concat(paths.destination + '/assets/js/scripts.js'))
	.pipe(dest('.'))
	.pipe(rename('scripts.min.js'))
	.pipe(uglify())
	.pipe(sourcemaps.write('.'))
	.pipe(dest(paths.destination + '/assets/js'))
	.pipe(browsersync.stream());
}

//  include htmls
function includehtml() {
	return src([
		paths.source + '/*.html'
	])
    .pipe(fileinclude({
		prefix: '@@',
		basepath: '@file',
		context: {
			css: 'style.min.css',
			lang: 'en',
			dir: 'ltr',
			urlfix: '',
		}
    }))
    .pipe(dest(paths.destination))
	.pipe(browsersync.stream());
}

// rtl html create
function rtlhtml(){
	return src([paths.source + '/*.html'])
	.pipe(fileinclude({
		prefix: '@@',
		basepath: '@file',
		context: {
			css: 'style-rtl.min.css',
			lang: 'ar',
			dir: 'rtl',
			urlfix: 'ar-',
		}
    }))
	.pipe(rename({
		prefix: "ar-",
	}))
	.pipe(dest(paths.destination))
	.pipe(browsersync.stream());
}

// remove dist folder
function distclean() {
	return src(paths.destination, {allowEmpty: true})
	.pipe(clean({force:true}));
}

// critical plugin ltr
function criticalcss() {
    return src([
		paths.destination + '/*.html',
		'!' + paths.destination + '/ar-*.html'
	])
    .pipe(critical({
        base: paths.destination,
        inline: true,
        css: paths.destination + '/assets/css/style.min.css',
	}))
	.on('error', err => {
		log.error(err.message);
	})
    .pipe(dest(paths.destination));
}

// critical plugin rtl
function criticalcssRtl() {
    return src(paths.destination + '/ar-*.html')
    .pipe(critical({
        base: paths.destination,
        inline: true,
        css: paths.destination + '/assets/css/style-rtl.min.css',
	}))
	.on('error', err => {
		log.error(err.message);
	})
    .pipe(dest(paths.destination));
}

// copy script folder
function copyUtils(){
    return src([
		paths.source + '/assets/scripts/utils.js'
	])
    .pipe(dest(paths.destination + '/assets/js/'))
}

// browsersync
function runbrowser() {
    browsersync.init({
        server: paths.destination,
        port: 4000
	});
	watch([paths.source + '/assets/scss/**/*.scss']).on('change', () => {
		sassToCss();
		console.log('css changes');
	});
	watch([paths.source + '/assets/scripts/main.js']).on('change', () => {
		minifyJs();
		console.log('script changes');
	});
	watch([paths.source + '/assets/scripts/vendors/*.js']).on('change', () => {
		vendorJs();
		console.log('vendor changes');
	});
	watch([paths.source + '/**/*.html']).on('change', () => {
		includehtml();
		browsersync.reload;
		console.log('html changes');
	});
}

// browsersync
function runbrowserrtl() {
    browsersync.init({
        server: paths.destination,
        port: 4000
	});
	watch([paths.source + '/assets/scss/**/*.scss']).on('change', () => {
		sassToCss();
		rtlCss();
		console.log('css changes');
	});
	watch([paths.source + '/assets/scripts/main.js']).on('change', () => {
		minifyJs();
		console.log('script changes');
	});
	watch([paths.source + '/assets/scripts/vendors/*.js']).on('change', () => {
		vendorJs();
		console.log('vendor changes');
	});
	watch([paths.source + '/**/*.html']).on('change', () => {
		includehtml();
		rtlhtml();
		browsersync.reload;
		console.log('html changes');
	});
}


exports.default = series(distclean, createDist, sassToCss, vendorJs, minifyJs, includehtml, runbrowser);
exports.defaultrtl = series(distclean, createDist, sassToCss, rtlCss, vendorJs, minifyJs, includehtml, rtlhtml, runbrowserrtl);
exports.build = series(distclean, createDist, sassToCss, vendorJs, minifyJs, includehtml, criticalcss);
exports.buildrtl = series(distclean, createDist, sassToCss, rtlCss, vendorJs, minifyJs, includehtml, rtlhtml, criticalcss, criticalcssRtl);