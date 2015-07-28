"use strict";

var INJECT_DECORATOR_PATH = "@yuzu/yep-app/lib/decorators";

// Regexes
var FN_ARGS = /^(?:module.exports =|export default) function\s*[^\(]*\(\s*([^\)]*)\)/m;
var CL_ARGS = /^export default class/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var STRIP_OBJ_DESTRUCTURING = /(,\s*{.*})/g;

function findMatches(text, regex) {
    return text.replace(STRIP_COMMENTS, "")
               .match(regex);
}

function findDependenciesInFunction(signatureMatch) {
    var dependencies = [];
    var signature = signatureMatch.replace(STRIP_OBJ_DESTRUCTURING, "");

    signature.split(FN_ARG_SPLIT).forEach(function (arg) {
        arg.replace(FN_ARG, function (all, prefix, name) { // prefix is "_" which we never use.
            if (name !== "opts") {
                dependencies.push("\"" + name + "\"");
            }
        });
    });

    return dependencies;
}

function findDependenciesInClass(_, text) {
    var CONSTRUCTOR_ARGS = /constructor\s*[^\(]*\(\s*([^\)]*)\)/m;
    var dependencies = [];

    var signatureMatches = findMatches(text, CONSTRUCTOR_ARGS);

    if (signatureMatches && signatureMatches.length > 0) {
        dependencies = findDependenciesInFunction(signatureMatches[1]);
    }

    return dependencies;
}

function findDependencies(text) {
    // Support both es6 default modules and commonjs single exports.
    var dependencies = [];

    [[FN_ARGS, findDependenciesInFunction], [CL_ARGS, findDependenciesInClass]].some(function (parts) {
        var exportRegex = parts[0];
        var findDeps = parts[1];

        var signatureMatches = findMatches(text, exportRegex);

        if (signatureMatches && signatureMatches.length > 0) {
            dependencies = findDeps(signatureMatches[1], text);
            return true;
        }
    });

    return dependencies;
}

module.exports = function AutoDecorateInjectTransfomer(writer) {
    this.write = function (data) {
        var dependencies = findDependencies(data);
        if (dependencies.length) {
            // Auto import inject annotator.
            writer.appendToBody("import { inject } from \"" + INJECT_DECORATOR_PATH + "\";");
            writer.decorateExport("inject", dependencies);
        }
    };
};
