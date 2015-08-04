"use strict";

module.exports = function ComponentNameSetter(writer) {

    function filenameWithOffset(negativeOffsetForCutoff) {
        return function () {
            var filename = writer.filename;
            return filename[0].toLowerCase() + filename.slice(1, negativeOffsetForCutoff);
        };
    }

    var componentTypes = {
        ui: {
            isMatch: function () {
                return /UI\.js$/.test(writer.filename);
            },
            name: filenameWithOffset(-5)
        },

        action: {
            isMatch: function () {
                return /actions(\\|\/)(.*)\.js$/.test(writer.file);
            },
            name: filenameWithOffset(-3)
        }
    };

    this.write = function () {
        var componentName;

        Object.keys(componentTypes).some(function (type) {
            var componentFile = componentTypes[type];
            var isMatch = componentFile.isMatch() && /(export default|module.exports =)/.test(writer.body);
            if (isMatch) {
                componentName = componentFile.name();
            }

            return isMatch;
        });

        if (componentName) {
            writer.appendToDefaultExport("prototype.componentName = \"" + componentName + "\"");
        }
    };
};
