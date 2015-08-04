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
        body += content + "\n";
    };

    Object.defineProperties(this, {
        file: { value: file },
        filename: { value: path.basename(file) },
        body: {
            get: function () {
                var text;
                var footer = exportExpressions.length > 0 ? exportExpressions.join("\n") + "\n" : "";

                if (body.indexOf("//# sourceMappingURL") >= 0) {
                    text = body.replace("//# sourceMappingURL", "\n" + footer + "\n" + "//# sourceMappingURL");
                } else {
                    text = body + footer;
                }

                return text;
            }
        }
    });
}

TransformWriter.DEFAULT_EXPORT_EXPR = DEFAULT_EXPORT_EXPR;
module.exports = TransformWriter;
