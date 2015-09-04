export default class SpecRef {
    constructor(referenceName) {
        return { $ref: referenceName };
    }
}
