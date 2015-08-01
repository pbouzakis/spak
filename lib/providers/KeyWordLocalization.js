export default class KeyWordLocalization {
    localize(path) {
        var [namespace, key] = path.split("/");
        return this._camelCaseToWords(key || namespace);
    }

    _camelCaseToWords(str){
        return str.match(/^[a-z]+|[A-Z][a-z]*/g).map(
            (part) => part[0].toUpperCase() + part.substr(1).toLowerCase()
        ).join(" ");
    }
}
