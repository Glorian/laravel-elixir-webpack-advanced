# laravel-elixir-webpack-advanced

Simple extension to *laravel elixir* to build javascript bundle with *webpack*.

## Install

```
npm install --save-dev laravel-elixir-webpack-advanced
```
## Features
- **ES6-loader** with [Babel](http://babeljs.io/)
	- source maps
	- multiple bundles
	- shared modules
- **Bower dependency resolver**
	- you can add any bower package to your application like you did with npm
	- images will be resolved automatically and placed in (plublicPath / js.outputFolder / <-name of bower package->) 
	- css (with correct assets path) will be extracted to plublicPath / js.outputFolder / <-name of main entry point->.css
- **HTML loader**
	- you can require any html template in your js-application
- **[Stylus](http://stylus-lang.com/) and [Sass|Scss](http://sass-lang.com/) loaders**
- **Native watcher**
	- if you start `gulp watch` - webpack task will started in watch mode, 
	so any further changes of application files would not restart webpack task

## Usage

### Example *Gulpfile*:

```javascript
var elixir = require("laravel-elixir"),
	config = elixir.config;

// Here you can override default elixir configuration
// config.assetsPath = 'path/to/assets/dir';
// ...

require("laravel-elixir-webpack-advanced");

elixir(function(mix) {
    mix.webpack("app.js");
});
```

First argument is the entry point[s] of your application _(default directory is resources/assets/js)_. 
In second argument you could pass webpack options. In production mode, bundle will be compressed. 
Third argument - object for [webpack.ProvidePlugin](https://webpack.github.io/docs/list-of-plugins.html#provideplugin).

#### Advanced example

```javascript
/**
* If you wish to add some vendor libs to your project - you can redefine `entry` option 
* in webpack config: `entry: { vendor: ['jquery', 'vue', ...] }`
* This list of libraries will be bundled into `vendor.js`
*/

elixir(function(mix) {
    mix.webpack(
    	/**
    	* You can simply write string: 'app' or 'app.js' => output: main.js
    	* or object: { bundle: 'app.js' } ...
    	*/
        { bundle: 'app.js' }, // Output will be: bundle.js
        {
        	entry: {
        		// before start gulp task - you should install jquery (or other libs) by npm or bower
        		vendor: ['jquery'] 
        	},
	        output: {
	        	// By default: `/${config.js.outputFolder}/` - (/js/)
            		publicPath: `/assets/${config.js.outputFolder}/` // Browser output path: /assets/js/
            	}
        }, 
        /** 
        * Global variables for vendor libs
        * No need to require jquery in all your modules
        */
        {
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }
    );
});
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
