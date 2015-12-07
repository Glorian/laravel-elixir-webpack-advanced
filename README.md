# laravel-elixir-webpack-advanced

Simple extension to *laravel elixir* to build javascript bundle with *webpack*.

## Install

```
npm install --save-dev laravel-elixir-webpack-advanced
```

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
In second argument you could pass webpack options. In production bundle will be compressed.
Third argument - define vendor libs. They would store in `vendor.js` entry point
Fourth argument - object for webpack [ProvidePlugin](https://webpack.github.io/docs/list-of-plugins.html#provideplugin) 

#### Advanced example

```javascript
elixir(function(mix) {
    mix.webpack(
        { bundle: "app.js" }, 
        {
	        outputDir: "public/js",
	        output: {
	            filename: "bundle.js"
            }
        }, 
        ['jquery'], 
        {
            $: 'jquery',
            jQuery: 'jquery'
        }
    );
});
```
