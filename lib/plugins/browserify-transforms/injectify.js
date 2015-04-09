"use strict";

// Browserify transform that adds injection hints to dependency injection framework.
// NB! The transform only adds hints if the module exports a single function.

var path = require("path");
var through = require("through");

var INJECT_HINT_MOD_EXPR = "module.exports";

function findDependencies(text) {
    // Support both es6 default modules and commonjs single exports.
    var FN_ARGS = /^(?:module.exports =|export default) function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var STRIP_OBJ_DESTRUCTURING = /(,\s*{.*})/g;
    var dependencies = [];

    var signatureMatches = text.replace(STRIP_COMMENTS, "")
                               .match(FN_ARGS);

    if (signatureMatches && signatureMatches.length > 0) {
        var signature = signatureMatches[1].replace(STRIP_OBJ_DESTRUCTURING, "");

        signature.split(FN_ARG_SPLIT).forEach(function (arg) {
            arg.replace(FN_ARG, function (all, prefix, name) { // prefix is "_" which we never use.
                if (name !== "opts") {
                    dependencies.push(name);
                }
            });
        });
    }

    return dependencies;
}

function isJadeTemplate(file) {
    return (/\.jade$/i).test(file);
}

function isNonChalkModule(file, grunt) {
    var chalkOrAppModule = /^node_modules[\/\\](chalk|app-|@app|@yuzu)/;
    var relativeFile = file.substr(process.cwd().length + 1);

    return !grunt.file.doesPathContain("app", file) &&
           !grunt.file.doesPathContain("lib", file) &&
           !chalkOrAppModule.test(relativeFile);
}

module.exports = function (grunt) {
    return function injectify(file) {
        if (isJadeTemplate(file) || isNonChalkModule(file, grunt)) {
            return through();
        }

        var data = "";

        function write(buf) {
            data += buf;
        }

        function end() {
            if (data.indexOf("\ufeff") >= 0) {
                console.log("File found w/ bom! ", file);
            }
            data = data.replace("\ufeff", ""); // Remove any boms.

            var dependencies = findDependencies(data);
            var metadata = [];

            if (dependencies.length) {
                metadata.push(INJECT_HINT_MOD_EXPR + ".inject = [\"" + dependencies.join("\", \"") + "\"];");
            }

            var filename = path.basename(file);
            if (/UI\.js$/.test(filename)) { // UI module
                var componentName = filename[0].toLowerCase() + filename.slice(1, -5);
                metadata.push(INJECT_HINT_MOD_EXPR + ".prototype.componentName = \"" + componentName + "\";");
            }

            if (metadata.length) {
                data += metadata.join("\n") + "\n";
            }

            data = "// ######## MODULE ######## " + file + " ######## //\n" + data;

            this.queue(data);
            this.queue(null);
        }

        return through(write, end);
    };
};
