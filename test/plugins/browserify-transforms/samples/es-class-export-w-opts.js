export default class SampleESWithOpts {
    constructor(foo, bar, baz, beepOpt, boopOpt) {
        this._foo = foo;
        this._bar = bar;
        this._baz = baz;
        this._beepOpt = beepOpt;
        this._boopOpt = boopOpt;
    }

    do() {
        console.log(this._foo, this._bar, this._baz, this._beepOpt, this._boopOpt);
    }

    doNot() {
        console.warn("why are you calling me?");
    }
}
