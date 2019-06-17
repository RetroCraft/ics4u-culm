/**
 * Represents a JavaScript keyword or token
 */
export class Keyword {
    constructor() {
        /**
         * Do the given keys return the literal eval(value) or String(value)
         */
        this.returnsString = true;
    }
    /**
     * String representation
     */
    toString() {
        return "";
    }
    /**
     * Check for equality
     */
    equals(other) {
        return this.value === other.value;
    }
}
//# sourceMappingURL=Keyword.js.map