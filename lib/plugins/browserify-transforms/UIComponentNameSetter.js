"use strict";

var path = require("path");

module.exports = function UIComponentNameSetter(file, metadata, exportPrefix) {
    this.annotate = function (data) {
        var filename = path.basename(file);
        if (/UI\.js$/.test(filename)) { // UI module
            var componentName = filename[0].toLowerCase() + filename.slice(1, -5);
            metadata.push(exportPrefix + ".prototype.componentName = \"" + componentName + "\";");
        }
    };    
}
