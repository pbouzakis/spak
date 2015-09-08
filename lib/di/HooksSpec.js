import SpecFromClass from "./SpecFromClass";

var count = 0;

export default class HooksSpec extends SpecFromClass {
    constructor(Hooks) {
        super("$hooks_" + count++, Hooks);
        this._specKey = count;
    }
    _onConfigCreated(config) {
        super._onConfigCreated(config);
        config.extend({
            init: { subscribeTo: "app.ready" }
        });
    }
    get specKey() {
        return this._specKey;
    }
}
