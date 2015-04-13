"use strict";

// Browserify transform that adds injection hints to dependency injection framework.
// NB! The transform only adds hints if the module exports a single function.

var path = require("path");
var through = require("through");
var InjectAnnotator = require("./InjectAnnotator");
var UIComponentNameSetter = require("./UIComponentNameSetter");
var ClassAnnotator = require("./ClassAnnotator");

var INJECT_HINT_MOD_EXPR = "module.exports";

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

var annotateProperty = INJECT_HINT_MOD_EXPR + ".annotate";
function annotationWriter(metadata) {
    return function (type, args) {
        metadata.push(annotateProperty + ".push(" + type + "(" + args + "));");
    };
}

module.exports = function (grunt) {
    return function annotatify(file) {
        if (isJadeTemplate(file) || isNonChalkModule(file, grunt)) {
            return through();
        }

        var filename = path.basename(file);
        var metadata = [annotateProperty + " = [];"];
        var annotate = annotationWriter(metadata);
        var injector = new InjectAnnotator(annotate, metadata, INJECT_HINT_MOD_EXPR);
        var nameSetter = new UIComponentNameSetter(filename, metadata, INJECT_HINT_MOD_EXPR);
        var classAnnotator = new ClassAnnotator(annotate, metadata, INJECT_HINT_MOD_EXPR);
        var data = "";

        function write(buf) {
            data += buf;
        }

        function end() {
            if (data.indexOf("\ufeff") >= 0) {
                console.log("File found w/ bom! ", file);
            }

            function append(appendData) {
                return data += appendData + "\n";
            }

            data = data.replace("\ufeff", ""); // Remove any boms.

            [injector, nameSetter, classAnnotator]
                .forEach(function (annotator) {
                    annotator.annotate(data, append);
                });

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
