import _ from "underscore";

var logger = _.object(
    ["log", "debug", "info", "warn", "error", "logError"].map(
        (method) => [method, () => {}]
    )
);

export default class NullLogger {
    container() {
        return logger;
    }
}
