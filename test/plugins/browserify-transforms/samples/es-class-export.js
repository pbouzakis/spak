"use strict";

export default class SampleES6Class {
    constructor(foo, bar, baz) {
        this._foo = foo;
        this._bar = bar;
        this._baz = baz;
    }

    do() {
        console.log(this._foo, this._bar, this._baz);
    }

    doNot() {
        console.warn("why are you calling me?");
    }
}
