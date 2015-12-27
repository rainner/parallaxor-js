/*!
 * Parallaxor JS - 1.0.0.
 * Creates mouse/mostion parallax effect on children elements of a container.
 * Copyright (c) 2016 - Rainner Lins - (http://rainnerlins.com/) - MIT license
 */
;(function( $ )
{
    'use strict';

    var _w = window,
        _s = window.screen,
        _b = document.body,
        _d = document.documentElement;

    /**
     * ***************************************************
     * Default options
     */
    var defaultOptions = {

        angleOffset   : 1,       // number to account for mobile device Y viewing angle (0: flat)
        motionFactor  : 0.075,   // number used to slow down device motion sensitivity (high: fast)
        easingSpeed   : 0.075,   // how fast/slow the easing effect will behave (high: fast)
        layerGrowSize : 50,      // how much each layer will grow based on z-index
        allowOverflow : true,    // allow elements to go past the bounding box (inside)
        invertX       : false,   // inverts the mouse/motion X axis for all layers
        invertY       : false,   // inverts the mouse/motion Y axis for all layers
    };

    /**
     * ***************************************************
     * Common utils functions
     */
    var utils = {

        // get container css property value
        getCssValue : function( element, property, fallback )
        {
            if( element && _w.getComputedStyle )
            {
                return _w.getComputedStyle( element, null ).getPropertyValue( property ) || fallback;
            }
            return fallback;
        },

        // test for CSS3 transform support
        transformSupport : function()
        {
            var elm     = document.createElement( 'div' ),
                listJs  = String( 'transform WebkitTransform MozTransform msTransform OTransform' ).split( ' ' ),
                listCss = String( 'transform -webkit-transform -moz-transform -ms-transform -o-transform' ).split( ' ' ),
                total   = listJs.length,
                index   = 0,
                value   = null,
                output  = {
                    propJs    : listJs[ 0 ],
                    propCss   : listCss[ 0 ],
                    support2d : false,
                    support3d : false,
                };

            // test 2D support
            for( var i=0; i < total; i++ )
            {
                if( elm.style[ listJs[ i ] ] !== undefined )
                {
                    index = i;
                    output.propJs = listJs[ i ];
                    output.propCss = listCss[ i ];
                    output.support2d = true;
                    break;
                }
            }
            // test 3D support
            if( output.support2d )
            {
                document.body.appendChild( elm );
                elm.style[ listJs[ index ] ] = 'translate3d(1px,1px,1px)';
                value = this.getCssValue( elm, listCss[ index ], 0 );
                output.support3d = ( value !== undefined && value.length > 0 && value !== 'none' ) ? true : false;
                document.body.removeChild( elm );
            }
            return output;
        },

        // enable hardware acceleration on an element
        accelerate : function( element )
        {
            if( typeof element === 'object' )
            {
                element.style[ 'WebkitTransform' ] = 'translate3d(0,0,0)';
                element.style[ 'WebkitTransformStyle' ] = 'preserve-3d';
                element.style[ 'WebkitBackfaceVisibility' ] = 'hidden';

                element.style[ 'MozTransform' ] = 'translate3d(0,0,0)';
                element.style[ 'MozTransformStyle' ] = 'preserve-3d';
                element.style[ 'MozBackfaceVisibility' ] = 'hidden';

                element.style[ 'transform' ] = 'translate3d(0,0,0)';
                element.style[ 'transformStyle' ] = 'preserve-3d';
                element.style[ 'backfaceVisibility' ] = 'hidden';
            }
        },

        // get a value from a data-attribute of an element
        attribute : function( element, attr, deft )
        {
            if( typeof element === 'object' && typeof attr === 'string'  )
            {
                var value = element.getAttribute( 'data-' + attr );
                if( value !== null )
                {
                    if( value === 'true' ) return true;
                    if( value === 'false' ) return false;
                    if( value === 'null' ) return null;
                    if( !isNaN( parseFloat( value ) ) && isFinite( value ) ) return parseFloat( value );
                    return value;
                }
            }
            return deft;
        },

        // lock a value between a min/max range
        clamp : function( value, min, max )
        {
            value = Math.max( value, min );
            value = Math.min( value, max );
            return value;
        },

        // checks for mobile device
        isMobile : function()
        {
            var uagent = ( navigator.userAgent || navigator.vendor || window.opera || '' ),
                mobile = uagent.match( /^.*(android|webos|iphone|ipad|ipod|blackberry|phone|playbook|xda|xiino|silk|mobile).*$/i ) ? true : false;

            return ( mobile ) ? true : false;
        },

        // screen orientation
        orientation : function()
        {
            var width  = _s.availWidth  || 0,
                height = _s.availHeight || 0,
                output = 0;

            if( 'orientation' in _w )
            {
                output = _w.orientation || 0;
            }
            else if( 'orientation' in _s || 'mozOrientation' in _s || 'msOrientation' in _s )
            {
                switch( _s.orientation || _s.mozOrientation || _s.msOrientation || '' )
                {
                    case 'portrait-primary':    output = 0;    break;
                    case 'portrait-secondary':  output = 180;  break;
                    case 'landscape-primary':   output = 90;   break;
                    case 'landscape-secondary': output = -90;  break;
                }
            }
            else if( 'matchMedia' in _w && _w.matchMedia( '(orientation: landscape)' ).matches )
            {
                output = this.isMobile() ? 90 : 0;
            }
            else if( width > height )
            {
                output = this.isMobile() ? 90 : 0;
            }
            return output;
        },

        // screen dimentions
        screen : function()
        {
            var orientation = this.orientation(),
                degree      = Math.abs( orientation ),
                oWidth      = _s.availWidth || 0,
                oHeight     = _s.availHeight || 0,
                width       = ( degree == 90 ) ? oHeight : oWidth,
                height      = ( degree == 90 ) ? oWidth : oHeight,
                mode        = ( degree == 90 ) ? 'landscape' : 'portrait';

            return {
                width       : width,
                height      : height,
                orientation : orientation,
                mode        : mode,
            };
        },

        // window dimentions
        window : function()
        {
            return {
                width  : Math.max( 0, _w.innerWidth || _d.clientWidth || _b.clientWidth || 0 ),
                height : Math.max( 0, _w.innerHeight || _d.clientHeight || _b.clientHeight || 0 ),
            };
        },

        // document dimentions and scroll position
        document : function()
        {
            return {
                width  : Math.max( 0, _b.scrollWidth || 0, _b.offsetWidth || 0, _d.clientWidth || 0, _d.offsetWidth || 0, _d.scrollWidth || 0 ),
                height : Math.max( 0, _b.scrollHeight || 0, _b.offsetHeight || 0, _d.clientHeight || 0, _d.offsetHeight || 0, _d.scrollHeight || 0 ),
                left   : Math.max( 0, _w.pageXOffset || _d.scrollLeft || _b.scrollLeft || 0 ) - ( _d.clientLeft || 0 ),
                top    : Math.max( 0, _w.pageYOffset || _d.scrollTop || _b.scrollTop || 0 ) - ( _d.clientTop || 0 ),
            };
        },

        // element dimentions and position
        element : function( element )
        {
            var width  = 0,
                height = 0,
                left   = 0,
                top    = 0;

            if( element )
            {
                width  = Math.max( 0, element.clientWidth || 0 );
                height = Math.max( 0, element.clientHeight || 0 );

                while( element )
                {
                    left   += ( element.offsetLeft - element.scrollLeft + element.clientLeft );
                    top    += ( element.offsetTop - element.scrollTop + element.clientTop );
                    element = element.offsetParent || null;
                }
            }
            return {
                width  : width,
                height : height,
                left   : left,
                top    : top,
            };
        },

        // pointer position
        mouse : function( e )
        {
            return {
                left : e ? Math.max( 0, e.pageX || e.clientX || 0 ) : 0,
                top  : e ? Math.max( 0, e.pageY || e.clientY || 0 ) : 0,
            };
        },

        // mobile orientation
        motion : function( e )
        {
            var degree     = this.orientation(),
                motionLeft = 0,
                motionTop  = 0;

            if( e && e.beta !== null && e.gamma !== null )
            {
                motionLeft = ( ( degree == 0 ) ? e.gamma : e.beta )  * 0.35;
                motionTop  = ( ( degree == 0 ) ? e.beta  : e.gamma ) * 0.35;

                if( degree == -90 ) motionLeft = ( motionLeft < 0 ) ? Math.abs( motionLeft ) : -Math.abs( motionLeft );
                if( degree == 90 )  motionTop  = ( motionTop < 0 )  ? Math.abs( motionTop )  : -Math.abs( motionTop );
            }
            return {
                left : motionLeft,
                top  : motionTop,
            };
        },
    };

    /**
     * ***************************************************
     * Parallaxor class
     */
    var Parallaxor = function( container, options )
    {
        // init local properties
        this.container = null;
        this.options   = defaultOptions;
        this.layers    = [];
        this.total     = 0;
        this.active    = false;
        this.fixed     = false;
        this.raf       = null;
        this.width     = 0;
        this.height    = 0;
        this.left      = 0;
        this.top       = 0;
        this.inputx    = 0;
        this.inputy    = 0;
        this.centerx   = 0;
        this.centery   = 0;
        this.rangex    = 0;
        this.rangey    = 0;
        this.tox       = 0;
        this.toy       = 0;

        // test for css transform support
        this.support = utils.transformSupport();

        // bind event handlers to this scope
        this.resizeHandler = this.resizeHandler.bind( this );
        this.mouseHandler  = this.mouseHandler.bind( this );
        this.motionHandler = this.motionHandler.bind( this );
        this.loopHandler   = this.loopHandler.bind( this );

        // init container and layers
        this.setOptions( options );
        this.setContainer( container );
        this.updateLayers();
        this.parallaxLayers();
        return this;
    };

    // merge options with defaults
    Parallaxor.prototype.setOptions = function( options )
    {
        options = ( typeof options === 'object' ) ? options : {};

        for( var prop in options )
        {
            if( options.hasOwnProperty( prop ) )
            {
                this.options[ prop ] = options[ prop ];
            }
        }
    };

    // get a value from the local options object
    Parallaxor.prototype.getOption = function( prop, deft )
    {
        if( typeof prop === 'string' && this.options.hasOwnProperty( prop ) )
        {
            return this.options[ prop ];
        }
        return deft;
    };

    // set the target container and children layers for parallax
    Parallaxor.prototype.setContainer = function( container )
    {
        this.container = null;
        this.layers = [];

        if( typeof container === 'object' ) { this.container = container; } else
        if( typeof container === 'string' ) { this.container = document.getElementById( container ); }

        if( this.container )
        {
            var count = this.container.children.length,
                layer = null,
                i     = 0;

            this.fixed = utils.getCssValue( this.container, 'position', '' ) == 'fixed' ? true : false;

            if( this.support.support3d )
            {
                utils.accelerate( this.container );
            }
            for( ; i < count; ++i )
            {
                layer = this.container.children[ i ];

                // only allow some tag types to be used for parallax
                if( /^(div|ol|ul|li|section|canvas|img|svg|figure|article|p)$/.test( layer.tagName.toLowerCase() ) )
                {
                    if( this.support.support3d )
                    {
                        utils.accelerate( layer );
                    }
                    this.layers.push( layer );
                }
            }
        }
    };

    // update the size and position of all layers in container
    Parallaxor.prototype.updateLayers = function()
    {
        if( this.container )
        {
            var e = utils.element( this.container );

            // update container info
            this.left    = e.left;
            this.top     = e.top;
            this.width   = e.width;
            this.height  = e.height;

            // update positions
            this.centerx = ( this.width / 2 );
            this.centery = ( this.height / 2 );
            this.rangex  = Math.max( this.centerx, this.width - this.centerx );
            this.rangey  = Math.max( this.centery, this.height - this.centery );

            // grab some option values for the layers
            var grow     = this.getOption( 'layerGrowSize', 50 ),
                speed    = this.getOption( 'easingSpeed', 0.075 ),
                overflow = this.getOption( 'allowOverflow', false ),
                invertx  = this.getOption( 'invertX', false ),
                inverty  = this.getOption( 'invertY', false );

            // layers placement
            var count    = this.layers.length,
                width    = this.width,
                height   = this.height,
                left     = 0,
                top      = 0,
                layer    = null,
                i        = 0;

            // setup layers
            for( ; i < count; ++i )
            {
                layer = this.layers[ i ];
                layer.parallax = {
                    index    : 0,
                    zindex   : 0,
                    width    : 0,
                    height   : 0,
                    left     : 0,
                    top      : 0,
                    grow     : utils.attribute( layer, 'grow', grow ),
                    speed    : utils.attribute( layer, 'speed', speed ),
                    overflow : utils.attribute( layer, 'overflow', overflow ),
                    invertx  : utils.attribute( layer, 'invertx', invertx ),
                    inverty  : utils.attribute( layer, 'inverty', inverty ),
                };

                width  = this.width + ( layer.parallax.grow * ( i + 1 ) );
                height = this.height + ( layer.parallax.grow * ( i + 1 ) );
                left   = ( this.width - width ) * 0.5; // center
                top    = ( this.height - height ) * 0.5; // center

                this.setLayerIndex( layer, i );
                this.setLayerSize( layer, width, height );
                this.setLayerPosition( layer, left, top );

                this.tox = left;
                this.toy = top;
            }
        }
    };

    // adjust position of all layers based on current mouse/motion value
    Parallaxor.prototype.parallaxLayers = function()
    {
        if( this.container )
        {
            var count   = this.layers.length,
                layer   = null,
                scrollx = 0,
                scrolly = 0,
                i       = 0;

            if( this.fixed )
            {
                var doc = utils.document();
                scrollx = doc.left;
                scrolly = doc.top;
            }
            for( ; i < count; ++i )
            {
                layer = this.layers[ i ];

                // build layer parallax properties
                var width    = layer.parallax.width    || 0,
                    height   = layer.parallax.height   || 0,
                    left     = layer.parallax.left     || 0,
                    top      = layer.parallax.top      || 0,
                    grow     = layer.parallax.grow     || 50,
                    speed    = layer.parallax.speed    || 0.075,
                    overflow = layer.parallax.overflow,
                    invertx  = layer.parallax.invertx,
                    inverty  = layer.parallax.inverty,
                    offsetx  = ( width - this.width ),
                    offsety  = ( height - this.height ),
                    depthx   = ( invertx ) ? offsetx : -offsetx,
                    depthy   = ( inverty ) ? offsety : -offsety;

                // calculate new positions based on device value
                this.tox = depthx * ( this.inputx * 50 / 100 ) - ( offsetx * 0.5 );
                this.toy = depthy * ( this.inputy * 50 / 100 ) - ( offsety * 0.5 );

                // ease to new position
                left += ( this.tox - left ) * speed;
                top  += ( this.toy - top ) * speed;

                // cap bounding box
                if( overflow !== true )
                {
                    left = utils.clamp( left, -offsetx, 0 );
                    top  = utils.clamp( top, -offsety, 0 );
                }
                // update layer position
                left = ( left - scrollx );
                top  = ( top  - scrolly );
                this.setLayerPosition( layer, left, top );
            }
        }
    };

    // set layer z-index value
    Parallaxor.prototype.setLayerIndex = function( layer, index )
    {
        if( layer )
        {
            index = index || 0;
            layer.parallax.index  = index;
            layer.parallax.zindex = index + 1;
            layer.style.display   = 'block';
            layer.style.position  = 'absolute';
            layer.style.zIndex    = index || 1;
        }
    };

    // set layer size
    Parallaxor.prototype.setLayerSize = function( layer, width, height )
    {
        if( layer )
        {
            layer.parallax.width  = width;
            layer.parallax.height = height;
            layer.width           = width;
            layer.height          = height;
            layer.style.width     = width  + 'px';
            layer.style.height    = height + 'px';
        }
    };

    // set layer position
    Parallaxor.prototype.setLayerPosition = function( layer, left, top )
    {
        if( layer )
        {
            layer.parallax.left = left;
            layer.parallax.top  = top;

            if( this.support.support3d )
            {
                layer.style[ this.support.propJs ] = 'translate3d( '+ left +'px, '+ top +'px, 0 )';
                return;
            }
            if( this.support.support2d )
            {
                layer.style[ this.support.propJs ] = 'translate( '+ left +'px, '+ top +'px )';
                return;
            }
            layer.style.left = left + 'px';
            layer.style.top = top + 'px';
        }
    };

    // event handler for window resize
    Parallaxor.prototype.resizeHandler = function( e )
    {
        this.updateLayers();
        this.parallaxLayers();
    };

    // event handler for mouse move
    Parallaxor.prototype.mouseHandler = function( e )
    {
        if( this.active )
        {
            // mouse input relative to container size/position
            var input   = utils.mouse( e );
            this.inputx = ( input.left - this.left - this.centerx ) / this.rangex;
            this.inputy = ( input.top - this.top - this.centery ) / this.rangey;
        }
    };

    // event handler for device motion
    Parallaxor.prototype.motionHandler = function( e )
    {
        if( this.active )
        {
            var offset = this.getOption( 'angleOffset', 1 ),
                factor = this.getOption( 'motionFactor', 0.075 ),
                input  = utils.motion( e );

            // motion input with offset and damp values applied
            this.inputx = ( input.left * factor );
            this.inputy = ( input.top * factor ) - offset;
        }
    };

    // event handler for animation loop
    Parallaxor.prototype.loopHandler = function()
    {
        if( this.active && document.hasFocus() )
        {
            this.parallaxLayers();
        }
        this.raf = window.requestAnimationFrame( this.loopHandler );
    };

    // start animation
    Parallaxor.prototype.enable = function()
    {
        if( this.active !== true )
        {
            window.addEventListener( 'resize', this.resizeHandler );
            window.addEventListener( 'mousemove', this.mouseHandler );
            window.addEventListener( 'deviceorientation', this.motionHandler );
            this.raf = window.requestAnimationFrame( this.loopHandler );
            this.active = true;
        }
    };

    // stop animation
    Parallaxor.prototype.disable = function()
    {
        if( this.active !== false )
        {
            window.removeEventListener( 'resize', this.resizeHandler );
            window.removeEventListener( 'mousemove', this.mouseHandler );
            window.removeEventListener( 'deviceorientation', this.motionHandler );
            window.cancelAnimationFrame( this.raf );
            this.active = false;
        }
    };

    // export
    window.Parallaxor = Parallaxor;

})();