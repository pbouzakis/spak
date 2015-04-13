"use strict";

var DECORATOR_REGEX = /^\/\/\s@(.*)/gm;

var annotatorHandlers = {};

function callTypeHandler(type, params) {
    var handler = annotatorHandlers[type];
    handler(params);
}

function ClassAnnotator(annotate, metadata, exportPrefix) {
    var results;
    var annotationString;
    var annotateParams;
    var type;
    var args = "";

    this.annotate = function (data, append) {
        // find an annotation one at a time.
        while ((results = DECORATOR_REGEX.exec(data)) !== null) {
            annotationString = results[1]; // Ex. "@nameOfAnnotation(a, b)".
            annotateParams = annotationString.split("("); // Split type from args.
            type = annotateParams[0];

            if (annotateParams.length > 1) { // Check if we have "(a, b)".
                args = annotateParams[1].replace(")", "");
            }

            // Check for a registered annotator type handler.
            if (type in annotatorHandlers) {
                callTypeHandler(type, {
                    append: append,
                    moduleContents: data,
                    args: args
                });
            }

            annotate(name, args);
        }
    };    
}
module.exports = exports = ClassAnnotator;

exports.registerTypes = function (types) {
    types.forEach(function (type) {
        annotatorHandlers[type.name] = type.handler;
    });
};
