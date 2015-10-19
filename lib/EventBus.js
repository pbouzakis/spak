import _ from "underscore";
import { makeEmitter } from "pubit-as-promised";

var addDot = (s) => s + ".";
var upperFirst = (s) => s[0].toUpperCase() + s.slice(1);

var makeAppEv = (prefix) => {
    var prefixWithDot = (nameOfEv) => addDot(prefix) + nameOfEv;
    var prefixAndUpperFirst = (nameOfEv) => prefix + upperFirst(nameOfEv);
    return _.contains(prefix, ".") ? prefixAndUpperFirst : prefixWithDot;
};

export default class EventBus {
    constructor() {
        this.publish = makeEmitter(this);
    }
    makeDualEmitter(publisher, { events, prefix }) {
        var localPublish = makeEmitter(publisher, events);
        var nameOfAppEv = makeAppEv(prefix);

        var dualPublish = (...args) => {
            var [ev, ...appArgs] = args;
            localPublish(...args);
            this.publish(nameOfAppEv(ev), publisher, ...appArgs);
        };

        dualPublish.when = (...args) => {
            var [ev, ...appArgs] = args;
            return localPublish.when(...args).then(() => {
                return this.publish.when(nameOfAppEv(ev), publisher, ...appArgs);
            });
        };

        return dualPublish;
    }
}
