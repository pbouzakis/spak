"use strict";

export default class SampleESClassDecOpts {
    constructor(foo, bar, baz, beepOpt, boopOpt, { size, color }) {
        this._foo = foo;
        this._bar = bar;
        this._baz = baz;
        this._beepOpt = beepOpt;
        this._boopOpt = boopOpt;
        this._size = size;
        this._color = color;
    }

    do() {
        console.log(this._foo, this._bar, this._baz, this._beepOpt, this._boopOpt, this._size, this._color);
    }

    doNot() {
        console.warn("why are you calling me?");
    }
}
