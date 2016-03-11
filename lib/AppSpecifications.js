import _ from "underscore";
import Registry from "./Registry";

class CollectRegistrationsBuilder {
    build(specs) {
        const TYPES = ["$actions", "$hooks"];

        var container = {
            $actions: this._actionMap(specs.actions),
            $hooks: specs.hooks
        };

        return specs.all().reduce((container, spec) => (
            _.extend(container, _.omit(spec.registration, ...TYPES))
        ), container);
    }

    _actionMap(actions) {
        return _.object(
            actions.map((action) => (
                Array.isArray(action)
                    ? [action[0], action[1]]
                    : [action.componentName, action]
            ))
        );
    }
}

// @Implements `Specifications` - see (doc/specifications.md)
export default class AppSpecifications extends Registry {
    constructor(builder = new CollectRegistrationsBuilder()) {
        super("specs");
        this._builder = builder;
    }

    useBuilder(builder) {
        this._builder = builder;
    }

    hasRegistered(key) {
        return this.hasWhere(spec => key in spec.registration);
    }

    get actions() {
        return this.collect("$actions");
    }

    get hooks() {
        return this.collect("$hooks");
    }

    // Only works with items that are registered as lists.
    collect(type) {
        return this.all().reduce((prev, spec) => (
            Array.isArray(spec.registration[type])
                ? prev.concat(spec.registration[type])
                : prev
        ), []);
    }

    build() {
        return this._builder.build(this);
    }

    static get Builder() { return CollectRegistrationsBuilder; }
}
