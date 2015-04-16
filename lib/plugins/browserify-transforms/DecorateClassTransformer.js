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
    var decoratorParams;
    var nameOfDecorator;
    var args = [];

    this.write = function (data) {
        // find an decorator one at a time.
        while ((results = DECORATOR_REGEX.exec(data)) !== null) {
            decoratorExpression = results[1]; // Ex. "@nameOfDecorator(a, b)".
            decoratorParams = decoratorExpression.split("("); // Split type from args.
            nameOfDecorator = decoratorParams[0];

            if (decoratorParams.length > 1) { // Check if we have "(a, b)".
                var argsString = decoratorParams[1].replace(")", "").split(",");
                args = JSON.parse("[" + argsString + "]");
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
