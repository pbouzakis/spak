"use strict";

export default function SampleESDecOpts(foo, bar, baz, beepOpt, boopOpt, { size, color }) {
    this.doSomething = function () {
        console.log(foo, bar, baz, beepOpt, boopOpt, size, color);
    };

    this.doNot = function () {
        console.warn("why are you calling me?");
    };
}
