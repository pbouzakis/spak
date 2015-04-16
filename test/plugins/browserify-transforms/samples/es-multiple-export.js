"use strict";

export default function SampleES(foo, bar, baz) {
    this.do = function () {
        console.log(foo, bar, baz);
    };

    this.doNot = function () {
        console.warn("why are you calling me?");
    };
}

export function helper() {
    return true;
}
