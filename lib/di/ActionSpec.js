import SpecFromClass from "./SpecFromClass";

export default class ActionSpec extends SpecFromClass {
    constructor(...args) {
        var name;
        var Action;

        if (args.length === 2) {
            [name, Action] = args;
        } else {
            [Action] = args;
            name = Action.prototype.componentName;
        }

        super(name, Action);
    }
    _onConfigCreated(config) {
        super._onConfigCreated(config);
        config.extend({ action: this._roles.toSpecKeys() });
    }
}
