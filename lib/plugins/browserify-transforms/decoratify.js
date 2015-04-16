"use strict";

// Browserify transform that adds/looks for decorators in a module.
// The module will delegate to transformer helpers which look or add specific decorators to the module.

// NB! The module being transformed must provide a default export in order to support decorators.
// Either `module.exports = ` or `export default`.

var through = require("through");
var TransformWriter = require("./TransformWriter");
var AutoDecorateInjectTransformer = require("./AutoDecorateInjectTransformer");
var UIComponentNameSetter = require("./UIComponentNameSetter");
var DecorateClassTransformer = require("./DecorateClassTransformer");

function decoratorTransformers(writer) {
    var injectTransformer = new AutoDecorateInjectTransformer(writer);
    var nameSetTransformer = new UIComponentNameSetter(writer);
    var classTransformer = new DecorateClassTransformer(writer);

    return [injectTransformer, nameSetTransformer, classTransformer];
}

function stripBomsFrom(file, data) {
    if (data.indexOf("\ufeff") >= 0) {
        console.log("File found w/ bom! ", file);
    }

    return data.replace("\ufeff", ""); // Remove any boms.
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

function shouldIgnore(file, grunt) {
    return isJadeTemplate(file) || isNonChalkModule(file, grunt);
}

module.exports = exports = function create(grunt, opts) {
    if (opts && opts.transformers) {
        DecorateClassTransformer.register(opts.transformers);
    }

    return function decoratify(file) {
        // RETURN EARLY! If module should not be transformed, do no work.
        if (shouldIgnore(file, grunt)) {
            return through();
        }

        var data = "";

        function write(buf) {
            data += buf;
        }

        function end() {
            /* jshint validthis:true */
            var writer = new TransformWriter(file, stripBomsFrom(file, data));

            decoratorTransformers(writer).forEach(function (transformer) {
                transformer.write(data);
            });

            var moduleBody = "// ######## MODULE ######## " + file + " ######## //\n" + writer.body;

            this.queue(moduleBody);
            this.queue(null);
        }

        return through(write, end);
    };
};
