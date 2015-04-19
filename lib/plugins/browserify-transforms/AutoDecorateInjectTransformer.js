"use strict";

var INJECT_DECORATOR_PATH = "@yuzu/yep-app/lib/decorators";

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
                    dependencies.push("\"" + name + "\"");
                }
            });
        });
    }

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
