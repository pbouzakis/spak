"use strict";

exports.SampleNode = function (foo, bar, baz) {
    this.do = function () {
        console.log(foo, bar, baz);
    };

    this.doNot = function () {
        console.log("why are you calling me?");
    };
};