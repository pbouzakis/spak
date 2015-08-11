import _ from "underscore";

export default class AppConfig {
    constructor(...valueConfigs) {
        valueConfigs.forEach((values) => this.merge(values));
    }

    merge(values) {
        _.extend(this, values);
    }

    defaults(defaults) {
        _.defaults(this, defaults);
    }
}
