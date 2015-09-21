import _ from "underscore";

export default class Registry {
    constructor(name, ...objsToRegister) {
        this._name = name;
        this._registry = objsToRegister;
    }
    get name() {
        return this._name;
    }
    register(obj) {
        this._registry.push(obj);
    }
    lookup(name) {
        return _.findWhere(this._registry, { name });
    }
    lookupWhere(criteria) {
        var predicate = typeof criteria === "function" ? criteria
                                                       : _.partial(this._lookupMatch, criteria);
        var found = null;
        this._registry.some((candidate) => {
            if (predicate(candidate)) {
                found = candidate;
                return true;
            }
        });
        return found;
    }
    has(name) {
        return !!this.lookup(name);
    }
    all() {
        return this._registry;
    }
    clear() {
        this.all().forEach((obj) => {
            if (typeof obj.onRegistryRemoval === "function") {
                obj.onRegistryRemoval();
            }
        });
        this._registry = [];
    }
    _lookupMatch(criteria, candidateInRegistry) {
        return candidateInRegistry.isMatchFor(criteria);
    }
}
