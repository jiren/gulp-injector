#gulp-inject 
>Inject files into code.  

> Made for gulp 3

## Usage
First, install `gulp-inject` as a dev dependency:
`npm install --save-dev gulp-inject`

Inject files by adding comments `inject` and filename. In following example it will include `my_module.js`.

```
function somethingNew(){

  /* inject my_module.js */

}
```

`gulpfile.js`:

```javascript
var gulp		= require('gulp'),
	include		= require('gulp-inject'),

gulp.task("scripts", function() {
	gulp.src('src/js/main.js')
		.pipe( inject() )
		.pipe( gulp.dest("dist/js") )
});

gulp.task("default", "scripts");
```

## Licence

[MIT License](https://github.com/jiren/gulp-injector/blob/master/LICENSE.md)
