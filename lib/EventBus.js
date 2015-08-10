import { makeEmitter } from "pubit-as-promised";

export default class EventBus {
    constructor() {
        this.publish = makeEmitter(this);
    }
}
