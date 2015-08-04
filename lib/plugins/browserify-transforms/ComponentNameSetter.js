"use strict";

module.exports = function ComponentNameSetter(writer) {
    this.write = function () {
        var filename = writer.filename;
        if (/UI\.js$/.test(filename)) { // UI module
            var componentName = filename[0].toLowerCase() + filename.slice(1, -5);
            writer.appendToDefaultExport("prototype.componentName = \"" + componentName + "\"");
        }
    };
};
