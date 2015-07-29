"use strict";

export default function SampleNodeWithOpts(foo, bar, baz, beepOpt, boopOpt) {
    this.doSomething = function () {
        console.log(foo, bar, baz, beepOpt, boopOpt);
    };

    this.doNot = function () {
        console.warn("why are you calling me?");
    };
}
