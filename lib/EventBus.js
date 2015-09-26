import { makeEmitter } from "pubit-as-promised";

export default class EventBus {
    constructor() {
        this.publish = makeEmitter(this);
    }
    makeDualEmitter(publisher, { events, prefix }) {
        var localPublish = makeEmitter(publisher, events);
        var nameOfAppEv = (nameOfEv) => prefix + nameOfEv[0].toUpperCase() + nameOfEv.slice(1);

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
