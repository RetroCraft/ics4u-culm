/**
 * Global utility functions
 */
export const Utilities = {
    checkRegex: /[^\[\]\(\)\!\+]{1}/g,
    /**
     * Check if code only uses `()[]!+`
     * @param code Code to check
     */
    validString: (code) => {
        const m = code.match(Utilities.checkRegex);
        if (!m || m.length === 0) {
            return true;
        }
        return false;
    },
    /**
     * Sorting predicate for sorting Keywords by both priority and value
     * @param a Keyword to compare
     * @param b Keyword to compare
     * @returns {Number} less than 0 if a < b, greater than 0 if a > b, 0 if a = b
     */
    priorityValue: (a, b) => {
        if (a.priority !== b.priority)
            return a.priority - b.priority;
        if (a.value < b.value)
            return -1;
        if (a.value > b.value)
            return 1;
        return 0;
    },
    /**
     * Escape a string for RegExp usage
     * @param re String to escape
     */
    escapeRegExp: (re) => re.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    // SOME ARRAY UTILITIES
    // JAVASCRIPT REALLY NEEDS TO GET TOGETHER AND HANDLE ARRAYS NICELY LIKE PYTHON
    /**
     * Flatten a deep array
     * @param arr Array to flatten
     * @author Mozilla Development Network <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#reduce_and_concat>
     */
    flat: (arr) => arr.reduce((acc, val) => Array.isArray(val)
        ? acc.concat(Utilities.flat(val)) // uwu recursion
        : acc.concat(val), [])
};
//# sourceMappingURL=utilities.js.map