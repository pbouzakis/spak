"use strict";

var path = require("path");

var CSS_RELATIVE_IMG_URL_REGEX = /url\((?:\.\/)?images\/(\S+)\)/g;

/**
 * Stylus plugin that looks for any relative image url's inside a component stylus file.
 * If one is found (img url must start with `images` OR `./images`) it's replaced with an absolute path to the image.
 * For chalk-components this should be a directory inside your public images directory (which is done via grunt).
 * It is assumed that app component images are public.
 * @param {object} options
 *                    pathToApp: Path to application relative to root of project (ex "app") [REQUIRED]
 *                    pathToPublic: Absolute url path to build output from app [REQUIRED]
 */
module.exports = function stylusComponentImgUrlPlugin(options) {
    var pathToApp = options.pathToApp;
    var pathToPublic = options.pathToPublic;
    var pathToAppComponents = options.pathToAppComponents || pathToApp + "/components/";
    var pathToChalkComponents = options.pathToChalkComponents || "node_modules/chalk-components/";
    var pathToPublicChalkComponentImages = options.pathToPublicChalkComponentImages || "/images/chalk-components/";

    return function stylusPlugin() {
        return function (style) {
            var componentDir = path.dirname(style.options.filename);
            var imageDir;

            // Is a chalk component stylus file
            if (componentDir.indexOf(pathToChalkComponents) === 0) {
                imageDir = componentDir.replace(pathToChalkComponents, pathToPublicChalkComponentImages);
            // Is an app component stylus file
            } else if (componentDir.indexOf(pathToAppComponents) === 0) {
                imageDir = componentDir.replace(pathToApp + "/", pathToPublic);
            } else {
                return; // Nothing to do, get the hell out.
            }

            imageDir += "/images";
            var cssUrl = "url(" + imageDir + "/$1)";

            // Reset stylus file contents
            style.str = style.str.replace(CSS_RELATIVE_IMG_URL_REGEX, cssUrl);
        };
    };
};
