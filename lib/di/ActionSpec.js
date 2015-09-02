import SpecFromClass from "./SpecFromClass";
import { specKeyFromName } from "./specKey";

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
        this._actionNames = Array.isArray(name) ? name : [name];
    }
    _onConfigCreated(config) {
        super._onConfigCreated(config);
        config.action = this._actionNames.map(specKeyFromName);
    }
}
