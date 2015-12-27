[demo]: http://demo.sudofolio.com/parallaxor/example/
[twitter]: http://twitter.com/raintek_
[mit]: http://www.opensource.org/licenses/mit-license.php
[gulp]: http://gulpjs.com/

# Parallaxor

Uses mouse input, or motion from a device's gyroscope to create a parallax effect for children elements of a target container. You can see an example of this script in action **[here][demo]**.

## Setup (HTML)

You can use any block type container element with an ID that has other block type children elements to create a parallax effect. *Only some tags are allowed for the children layers* `div|ol|ul|li|section|canvas|img|svg|figure|article|p`.

You can interact and style your **layer elements** any way you want, but keep in mind that to create a parallax effect, some CSS properties will have to be changed by Parallaxor, such as `position, left, top, width, height, z-index, translate, translate3d` depending on device support.

By default, all layers will inherit the options defined in Parallaxor, however you can override the default options for each layer by using data attributes.

```html
<section id="scene1">
  <div data-speed="0.05">...</div>
  <canvas data-grow="80">...</canvas>
  <div data-overflow="false">...</div>
</section>
```

## Setup (JS)

Start by making sure to include the parallaxor.min.js file into your HTML document.

```html
<script type="text/javascript" src="/path/to/parallaxor.min.js"></script>
````

Then, create a new instance of Parallaxor, passing in an ID name, or DOM element object, and an optional object for options:

```javascript
var scene1 = new Parallaxor( 'scene1', {
    layerGrowSize : 60,
    allowOverflow : false,
});
scene1.enable();
```

The above example would cause each layer to grow by 60px relative to the size of the container multiplied by the z-index (order) of the layer, and it prevents the layers from passing the bounding box of the container (overflow).

## Methods

You will be able to call/recall some of the Parallaxor methods after initializing a new instance. Here is a list of useful methods that can be used after creating a new Parallaxor instance:

| Name              | Arguments        | Description                                                                        |
| ----------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `setOptions()`    | `object`         | Overrides the default Parallaxor options with new values provided.                 |
| `setContainer()`  | `string/object`  | Sets a new target container and scans the container for layer elements to be used. |
| `updateLayers()`  | `none`           | Updates size, position and other parallax related info for all available layers.   |
| `enable()`        | `none`           | Start the main loop and listening for input events.                                |
| `disable()`       | `none`           | Stop the main loop and listening for input events.                                 |

## Options

Here is a list of options that are accepted by Parallaxor. Each layer will inherit the available options within Parallaxor, but it is possible to specify individual options for each layer with the use of data attributes. Here is a table of both JS and HTML options params.

| Javascript       | Attribute        | Description                                                                                                       |
| ---------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `angleOffset`    | `none`           | A `number` to account for mobile device Y viewing angle when holding the device, `0` being flat down.             |
| `motionFactor`   | `none`           | A `number/float` used to calibrate device gyroscope motion sensitivity, higher being more sensitive.              |
| `easingSpeed`    | `data-speed`     | A `float` number between `0-1` used to specify how fast/slow the layers will move relative to input.              |
| `layerGrowSize`  | `data-grow`      | A `number` pixel value to specify how much each layer will grow based on z-index order (depth) by default.        |
| `allowOverflow`  | `data-overflow`  | A `boolean` value `true/false` to allow/prevent layer elements to go past the container's bounding box (inside).  |
| `invertX`        | `data-invertx`   | A `boolean` value `true/false` to invert the direction the layers move on the X axis.                             |
| `invertY`        | `data-inverty`   | A `boolean` value `true/false` to invert the direction the layers move on the Y axis.                             |

## Build

You will need to have NPM on your machine if you want to make changes to the Parallaxor source and build a new minified version. The packages needed are listed in the packages.json file and a gulpfile is already included, so just run these commands to fetch all the dependencies and build:

```
npm install
gulp build
```

You can also have Gulp **watch** the `source` directory for changes and automatically build the for you during development:

```
gulp watch
```

## Author

Rainner Lins: [@raintek_][twitter]

## License

Licensed under [MIT][mit].


