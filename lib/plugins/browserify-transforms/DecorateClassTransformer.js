"use strict";

var DECORATOR_REGEX = /^\/\/\s@(.*)/gm;

var transformersMap = {};

function callDecoratorTransform(name, params) {
    var transform = transformersMap[name];
    transform(params);
}

function DecorateClassTransformer(writer) {
    var results;
    var decoratorExpression;
    var decoratorSplit;
    var decoratorParams;
    var nameOfDecorator;
    var args = [];

    this.write = function (data) {
        // find an decorator one at a time.
        while ((results = DECORATOR_REGEX.exec(data)) !== null) {
            decoratorExpression = results[1]; // Ex. "@nameOfDecorator(a, b)".
            decoratorSplit = decoratorExpression.split("("); // Split type from args.
            nameOfDecorator = decoratorSplit[0];

            if (decoratorSplit.length > 1) { // Check if we have "(a, b)".
                decoratorParams = decoratorSplit.slice(1).join();
                decoratorParams = decoratorParams.slice(0, decoratorParams.length - 1);
                args = decoratorParams.split(",").map(function (param) {
                    return param.trim();
                });
            }

            // Check for a registered decorator transforms.
            if (nameOfDecorator in transformersMap) {
                callDecoratorTransform(nameOfDecorator, {
                    writer: writer,
                    moduleContents: data,
                    args: args
                });
            }

            writer.decorateExport(nameOfDecorator, args);
        }
    };
}
module.exports = exports = DecorateClassTransformer;

exports.register = function (transformers) {
    transformers.forEach(function (transformer) {
        transformersMap[transformer.decorator] = transformer.transform;
    });
};

exports.clear = function () {
    transformersMap = {};
};
