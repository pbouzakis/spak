"use strict";

module.exports = function SampleNode(foo, bar, baz) {
    this.do = function () {
        console.log(foo, bar, baz);
    };

    this.doNot = function () {
        console.warn("why are you calling me?");
    };
};

module.exports.helper = function () {
    return true;
};
