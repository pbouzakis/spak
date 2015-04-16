"use strict";

export function SampleNode(foo, bar, baz) {
    this.do = function () {
        console.log(foo, bar, baz);
    };

    this.doNot = function () {
        console.warn("why are you calling me?");
    };
}
