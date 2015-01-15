var fs = require('fs'),
    path = require('path'),
    es = require('event-stream'),
    gutil = require('gulp-util'),
    glob = require('glob');


var INJECT_REGEX = /\/\*\s*inject(.*)\s*\*\//mg; /* inject filename */ 
//var INJECT_REGEX = /(?:<!--|\/\*)\s*inject(.*)\s*(?:\*\/|-->)/mg; 
var JS_FILE_REGX = /\.js$/;
var fileCache = {},
    extensions = [];

module.exports = function (params) {
    var params = params || {};
    requiredFiles = {};
    extensions = [];

    if (params.extensions) {
        extensions = typeof params.extensions === 'string' ? [params.extensions] : params.extensions;
    }

    function inject(file, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            throw new gutil.PluginError('gulp-injector', 'stream not supported');
        }

        if (file.isBuffer()) {
            var newText = expand(String(file.contents), file.path);
            file.contents = new Buffer(newText);
        }

        callback(null, file);
    }

    return es.map(inject)
};

function expand(fileContent, filePath) {
    var regexMatch,
        matches = [],
        returnText = fileContent,
        indentedText,
        i;

    INJECT_REGEX.lastIndex = 0;

    while (regexMatch = INJECT_REGEX.exec(fileContent)) {
        matches.push(regexMatch);
    }

    i = matches.length;
    while (i--) {
      var match = matches[i],
        original = match[0],
        fileName = match[1].trim(),
        start = match.index,
        end = start + original.length,
        indentIndex = start - 1,
        inlineContent,
        startLine = '',
        c ;

      inlineContent = expand(readFile(fileName), fileName);

      while( (c = returnText.charAt(indentIndex)) != '\n' && indentIndex >= 0){
        indentIndex--;
        startLine = startLine + c;
      }

      if(!fileName.match(JS_FILE_REGX)){
        indentedText = escapeContent(inlineContent);
      }else{
        indentedText = addLeadingWhitespace(startLine, inlineContent);
      }

      returnText = replaceStringByIndices(returnText, start, end, indentedText);
    }

    return returnText;
}


function addLeadingWhitespace(whitespace, string) {
  if (!whitespace.match(/^\s+/)) {
    return string + "\n";
  }

  return string.split("\n").map(function(line, i) {
    return i ? whitespace + line : line;
  }).join("\n") + "\n";
}

function replaceStringByIndices(string, start, end, replacement) {
    return string.substring(0, start) + replacement + string.substring(end);
}

function escapeContent(content) {
  content = content.replace(/'/g, '\\\'');
  return "'" + String(content.replace(/\r?\n/g, '')) + "'";
};

function readFile(filepath, encoding){
  if (typeof (encoding) == 'undefined'){
    encoding = 'utf8';
  }

  return String(fs.readFileSync(filepath, encoding));
}
