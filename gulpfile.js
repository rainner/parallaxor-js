/**
 * Dependencies
 */
var PKG     = require( './package.json' ),
    gulp    = require( 'gulp' ),
    plugins = require( 'gulp-load-plugins' )();

/**
 * Build header info
 */
var getHeader = function( description, author, version, license )
{
    return [
        "/*!",
        " * @Date: Compiled "  + new Date() + ".",
        " * @Description: "    + String( description || PKG.description || 'No description' ),
        " * @Author: "         + String( author      || PKG.author      || 'No author' ),
        " * @Version: "        + String( version     || PKG.version     || 'No version' ),
        " * @License: "        + String( license     || PKG.license     || 'No license' ),
        " */"
    ].join( "\n" ) + "\r\n\r\n";
};

/**
 * Build task
 */
gulp.task( 'build', function()
{
    var folder = 'build',
        name   = 'parallaxor.js',
        files  = [
        'source/animframe.js',
        'source/parallaxor.js',
    ];
    return gulp.src( files )
    .pipe( plugins.uglify( { preserveComments: false } ) )
    .pipe( plugins.replace( /[\t\r\n]+/g, '' ) )
    .pipe( plugins.wrapper( { header: "/* ${filename} */ \r\n" } ) )
    .pipe( plugins.concat( name, { newLine: "\r\n\r\n" } ) )
    .pipe( plugins.header( getHeader() ) )
    .pipe( plugins.rename( { suffix: '.min' } ) )
    .pipe( gulp.dest( folder ) );
});

/**
 * Clean task
 */
gulp.task( 'clean', function()
{
    return gulp.src( ['build'], { read: false } ).pipe( plugins.clean() );
});

/**
 * Watch task
 */
gulp.task( 'watch', function()
{
    gulp.watch( 'source/**/*.js', ['build'] );
});

/**
 * Default task
 */
gulp.task( 'default', ['build'] );
