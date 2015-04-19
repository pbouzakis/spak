"use strict";

var path = require("path");
var DEFAULT_EXPORT_EXPR = "module.exports";

function TransformWriter(file, body) {
    var exportExpressions = [];

    function addExportExpression(expression, operator) {
        operator = operator || ".";
        exportExpressions.push(DEFAULT_EXPORT_EXPR + operator + expression + ";");
    }

    this.decorateExport = function (type, args) {
        var expr = "(" + type + "(" + args.join(", ") + ")(" + DEFAULT_EXPORT_EXPR + ")) || " + DEFAULT_EXPORT_EXPR;
        addExportExpression(expr, " = ");
    };

    this.appendToDefaultExport = addExportExpression;

    this.appendToBody = function (content) {
        body += content;
    };

    Object.defineProperties(this, {
        filename: { value: path.basename(file) },
        body: {
            get: function () {
                var footer = exportExpressions.length > 0 ? exportExpressions.join("\n") + "\n" : "";
                return body + footer;
            }
        }
    });
}

TransformWriter.DEFAULT_EXPORT_EXPR = DEFAULT_EXPORT_EXPR;
module.exports = TransformWriter;
