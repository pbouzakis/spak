import _ from "underscore";
import CreateConfig from "./CreateConfig";
import SpecRef from "./SpecRef";

class SpecRole {
    constructor(role) {
        this._role = role;
    }
    get specKey() {
        return this._role[0].toLowerCase() + this._role.slice(1);
    }
}

/**
 * @param  {string|Array} roleNames
 */
export default class SpecRoles {
    constructor(names) {
        names = Array.isArray(names) ? names : [names];
        this._roles = names.map((role) => new SpecRole(role));
    }
    get specKey() {
        return this.primaryRole.specKey;
    }
    writeAliasesTo(config) {
        // RETURN EARLY if no secondary roles. Nothing to alias.
        if (this._roles.length === 1) {
            return;
        }
        _.extend(config, _.object(
            this.secondaryRoles.map(
                (role) => [
                    role.specKey,
                    new CreateConfig({
                        fn: _.identity,
                        args: [new SpecRef(this.primaryRole.specKey)]
                    }).value
                ]
            )
        ));
    }
    get primaryRole() {
        return this._roles[0];
    }
    get secondaryRoles() {
        return this._roles.slice(1);
    }
    toSpecKeys() {
        return this._roles.map((role) => role.specKey);
    }
}
