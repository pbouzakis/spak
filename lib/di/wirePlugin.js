class ActionFacet {
    constructor() {
        this._actions = {};
    }
    create(resolver, proxy) {
        var namesForAction = proxy.options;
        var action = proxy.target;

        namesForAction.forEach((name) => {
            this.actions[name] = action;
        });

        resolver.resolve();
    }
    get actions() {
        return this._actions;
    }
}

export default function yepAppWirePlugin() {
    var actionFacet = new ActionFacet();

    return {
        context: {
            ready(resolver, wire) {
                wire.addComponent(actionFacet.actions, "$actions");
                resolver.resolve();
            }
        },
        facets: {
            action: actionFacet
        }
    };
}
