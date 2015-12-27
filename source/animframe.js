/*!
 * Animation Frame Polyfill
 */
(function()
{
    var x, v = ['ms', 'moz', 'webkit', 'o'];

    for( x = 0; x < v.length && !window.requestAnimationFrame; ++x )
    {
        window.requestAnimationFrame = window[ v[x]+'RequestAnimationFrame' ];
        window.cancelAnimationFrame  = window[ v[x]+'CancelAnimationFrame' ] || window[ v[x]+'CancelRequestAnimationFrame' ];
    }
    if( !window.requestAnimationFrame )
    {
        window.requestAnimationFrame = function( callback )
        {
            return window.setTimeout( callback, 1000/60 );
        };
    }
    if( !window.cancelAnimationFrame )
    {
        window.cancelAnimationFrame = function( timeout )
        {
            return clearTimeout( timeout );
        };
    }
})();
