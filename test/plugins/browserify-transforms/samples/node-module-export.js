"use strict";

module.exports = function SampleNode(foo, bar, baz) {
    this.doSomething = function () {
        console.log(foo, bar, baz);
    };

    this.doNot = function () {
        console.warn("why are you calling me?");
    };
};
