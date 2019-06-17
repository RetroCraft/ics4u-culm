import { Keyword } from "./Keyword.js";
/**
 * A base representation. Output should only contain primitives.
 */
export class Primitive extends Keyword {
    /**
     * Instantiate a Primitive
     * @param char Single character of primitive
     */
    constructor(char) {
        super();
        console.assert(char.length === 1, "Primitives should contain a single character.");
        this.value = char;
        // set priority to 0 since these are at the root of the tree
        this.priority = 0;
    }
    /**
     * @inheritdoc
     */
    toString() {
        return this.value;
    }
}
//# sourceMappingURL=Primitive.js.map