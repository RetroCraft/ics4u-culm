import { Keyword } from "./Keyword.js";
/**
 * A JavaScript value that can be represented as other values.
 *
 * ex. `false === ![]`
 */
export class Token extends Keyword {
    /**
     * Instantiate a Token
     * @param value Name/literal value to replace for
     * @param keys Obfuscated value as list of Keyword values
     * @param priority Depth in tree
     */
    constructor(value, keys, priority, returnsString = true) {
        super();
        this.value = value;
        this.keys = keys;
        this.priority = priority;
        this.returnsString = returnsString;
        console.assert(priority > 0, "Priority of Token should be non-zero. Use Primitive for base Keywords.");
    }
    /**
     * @inheritdoc
     */
    toString() {
        return this.keys.join("");
    }
}
//# sourceMappingURL=Token.js.map