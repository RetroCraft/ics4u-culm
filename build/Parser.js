import { Token } from "./Token.js";
import { Primitive } from "./Primitive.js";
import { Utilities } from "./utilities.js";
/**
 * Parses and obfuscates JavaScript
 */
export class Parser {
    /**
     * Instantiate a Parser and populate Keyword tree
     */
    constructor() {
        /**
         * All valid tokens currently parsed
         */
        this.tree = {};
        /**
         * List of primitives
         */
        this.primitives = {};
        /**
         * Tree as sorted array by priority then value for ease of manipulation.
         * Pardon the pun.
         */
        this.prioriTree = [];
        // generate primitives with oneliner
        "!()[]+".split("").forEach(char => {
            this.primitives[char] = new Primitive(char);
        });
        // BASICS (depth 1)
        this.addToken("false", "![]", false);
        this.addToken("true", "!![]", false);
        this.addToken("undefined", "[][[]]", false);
        this.addToken("NaN", "+[![]]", false);
        this.addToken("0", "+[]", false);
        this.addToken("1", "+true", false);
        for (let i = 2; i < 10; i++) {
            this.addToken(`${i}`, 
            // weird syntax for python "+".join(["!![]"]*i)
            Array(i)
                .fill("!![]")
                .join("+"), false);
        }
        // APPLYING BASICS + NUMBERS (depth 2)
        this.addToken("a", "(false+[])[1]");
        this.addToken("d", "(undefined+[])[2]");
        this.addToken("e", "(true+[])[3]");
        this.addToken("f", "(false+[])[0]");
        this.addToken("i", "(undefined+[])[5]");
        this.addToken("l", "(false+[])[2]");
        this.addToken("n", "(undefined+[])[6]");
        this.addToken("r", "(true+[])[1]");
        this.addToken("s", "(false+[])[3]");
        this.addToken("t", "(true+[])[0]");
        this.addToken("u", "(true+[])[2]");
        this.addToken("N", "(NaN+[])[0]");
        // APPLYING STRINGS (depth 3)
        // [].entries() => [object Array Iterator]
        // [].fill => function fill() { [native code] }
        this.addToken("Infinity", '+(1+"e"+[1]+[0]+[0]+[0])', false);
        this.addToken("b", '([]["entries"]()+[])[2]');
        this.addToken("c", '([]["fill"]+[])[3]');
        this.addToken("j", '([]["entries"]()+[])[3]');
        this.addToken("o", '([]["fill"]+[])[6]');
        this.addToken("A", '([]["entries"]()+[])[8]');
        this.addToken("I", '([]["entries"]()+[])[14]');
        this.addToken(" ", '([]["fill"]+[])[8]');
        this.addToken("(", '([]["fill"]+[])[13]');
        this.addToken(")", '([]["fill"]+[])[14]');
        this.addToken("[", '([]["entries"]()+[])[0]');
        this.addToken("]", '([]["entries"]()+[])[22]');
        this.addToken("{", '([]["fill"]+[])[16]');
        // number trickery
        this.addToken("+", '(+(1+"e"+[1]+[0]+[0])+[])[2]'); // 1e100 => 1e+100
        this.addToken(".", '(+(1+[1]+"e"+[2]+[0])+[])[1]'); // 11e20 => 1.1e+21
        // METASTRINGS (depth 4)
        // generally, x.constructor => "function [typeof x]()"... and x.constructor.name => typeof x
        const BoolCon = '(false)["constructor"]';
        const FuncCon = '[]["fill"]["constructor"]';
        const NumCon = '(+0)["constructor"]';
        const StrCon = '([]+[])["constructor"]';
        this.addToken("g", `(${StrCon}+[])[14]`);
        this.addToken("m", `(${NumCon}+[])[11]`);
        this.addToken("y", "(Infinity+[])[7]"); // shorter than using Array Iterator
        this.addToken("B", `(${BoolCon}+[])[9]`);
        this.addToken("F", `(${FuncCon}+[])[9]`);
        this.addToken("S", `(${StrCon}+[])[9]`);
        this.addToken(",", '([]["slice"]["call"](false+[])+[])[1]'); // "false" => "f,a,l,s,e"
        this.addToken("-", "(+(.+0000000001)+[])[2]"); // .0000000001 => 1e-10
        // INCEPTIOONNNNN (depth 5)
        // Number.toString(radix) can also give some rarer characters
        //   when doing this, we optimize by using the numbers with the lowest digital sum
        // we also have the capital F now so we can just flat out create Functions to do what we need
        //   this gives access to HTML functions (<, /, >) and [object Object] (O)
        this.addToken("h", '(+(17))["toString"](21)');
        this.addToken("k", '(+(20))["toString"](21)');
        this.addToken("p", '(+(25))["toString"](31)');
        this.addToken("q", '(+(26))["toString"](31)');
        this.addToken("v", '(+(31))["toString"](32)');
        this.addToken("w", '(+(32))["toString"](33)');
        this.addToken("x", '(+(33))["toString"](34)');
        this.addToken("z", '(+(35))["toString"](36)');
        this.addToken('"', '([]+[])["link"]()[8]');
        this.addToken("<", '([]+[])["italics"]()[0]');
        this.addToken("=", '([]+[])["link"]()[7]');
        this.addToken(">", '([]+[])["italics"]()[2]');
        this.addToken("/", '([]+[])["italics"]()[4]');
        this.addToken("}", '([]["fill"]+[])["slice"](-+1)');
        // WE BROKE LOGIC (depth 6)
        // forward slash gives us access to regexes (R, E, ?, :)
        //   new RegExp() => /(?:)/
        // p gives us escape() which gets the last hex letters (C, D) and %
        const RegExpCon = `${FuncCon}("return/false/")()["constructor"]`;
        this.addToken("C", `${FuncCon}("return escape")()(([]+[])["italics"]())[2]`);
        this.addToken("D", `${FuncCon}("return escape")()([]["fill"])["slice"](-+1)`);
        this.addToken("E", `(${RegExpCon}+[])[12]`);
        this.addToken("O", `(${FuncCon}("return{}")()+[])[8]`);
        this.addToken("R", `(${RegExpCon}+[])[9]`);
        this.addToken("%", `${FuncCon}("return escape")()(([]+[])["italics"]())[0]`);
        this.addToken(":", `(${RegExpCon}()+[])[3]`);
        this.addToken("?", `(${RegExpCon}()+[])[2]`);
        // i'm out of meta jokes (depth 7)
        // Date from D
        //   new Date() => Day Mon DD YYYY HH:MM:SS GMT±ZZZZ (Time Zone) giving us G, M, T
        this.addToken("G", `(${FuncCon}("return Date")()()+[])[25]`);
        this.addToken("M", `(${FuncCon}("return Date")()()+[])[26]`);
        this.addToken("T", `(${FuncCon}("return Date")()()+[])[27]`);
    }
    /**
     * Tree as array for ease of manipulation
     */
    get treeVals() {
        return Object.values(this.tree);
    }
    /**
     * Run tests to ensure each token was implemented properly
     */
    test() {
        for (const key in this.tree) {
            console.log("Testing: " + key);
            console.assert(key === String(eval(this.tree[key].toString())), `Token ${key} should evaluate to itself`);
        }
    }
    /**
     * Max depth of the tree
     */
    get treeDepth() {
        return Math.max(...this.treeVals.map(token => token.priority));
    }
    /**
     * Add a token to the tree
     * @param name Name of new token
     * @param keys JavaScript equivalent (will be tokenized)
     * @param returnsString Does the keystring return a string? Defaults to true
     * @returns Created token
     */
    addToken(name, keys, returnsString = true) {
        // handle some special edge cases (Primitives + literals)
        const parsedNumbers = keys.replace(/\d+/g, match => String(match)
            .split("")
            .map(digit => `[${digit}]`)
            .join("+"));
        const parsedStrings = parsedNumbers.replace(/"([^"]+)"/g, (match, string) => string.split("").join("+"));
        const tokenTree = parsedStrings.split(/([+!\[\]()])/g).map(part => {
            // because this.tokenize will eat up Primitives, we have to explicitly find them
            if (this.primitives[part])
                return this.primitives[part];
            return this.tokenize(part);
        });
        const tokens = Utilities.flat(tokenTree);
        const priority = Math.max(...tokens.map(t => t.priority)) + 1;
        const token = new Token(name, tokens, priority, returnsString);
        this.tree[name] = token;
        // update prioriTree
        // selection/bubble sorts used to be here and you witnessed how terrible those were
        // on a fully loaded tree with 50 MB of React.js
        // selection sort (56.33 seconds), bubble sort (212.10 seconds)
        // thank heavens for quicksort (basically zero seconds)
        this.prioriTree = this.treeVals.sort(Utilities.priorityValue);
        return token;
    }
    /**
     * Tokenize code
     * Warning to self: WILL replace Primitives
     * @param code JavaScript code to parse
     */
    tokenize(code) {
        // if already valid, return list of primitives
        if (Utilities.validString(code)) {
            return code.split("").map(char => this.tree[char]);
        }
        // so actual tokenizing is really hard
        // especially so when you're trying to make this in javascript
        // and also have it not take half a century to run
        // so we're going to take the stupid route and use dYnAmIc rEgExEs yAy
        const builder = `(${this.prioriTree
            .map(token => Utilities.escapeRegExp(token.value))
            .join("|")}|.)`;
        const re = RegExp(builder, "g");
        const parts = code.split(re).filter(part => Boolean(part)); // filter out blank (falsy) strings
        const tokens = [];
        for (const part of parts) {
            let foundToken = null;
            // linear search
            for (const token of this.prioriTree) {
                if (token.value === part) {
                    foundToken = token;
                }
            }
            // manually do each character with hex encoding if we didn't find it in tree
            if (!foundToken) {
                for (const char of part) {
                    // hacky way to get characters by doing an unescape(escape(x)) or unescape("%"+charCode(x))
                    let escaped = escape(char);
                    if (escaped === char) {
                        // ascii letter like H that escapes to itself
                        const code = char
                            .charCodeAt(0)
                            .toString(16)
                            .toUpperCase();
                        escaped = `%${code}`;
                    }
                    escaped = escaped.split("").join("+");
                    const js = `[]["fill"]["constructor"]("return unescape")()(${escaped})`;
                    foundToken = this.addToken(char, js);
                }
            }
            tokens.push(foundToken);
        }
        return tokens;
    }
    /**
     * Convert a list of tokens to a string
     * Use this instead of the default .toStrings to handle literal-returning keystrings
     * @param tokens List of tokens
     */
    stringify(tokens) {
        const string = [];
        for (const token of tokens) {
            if (token.returnsString) {
                string.push(`${token}`);
            }
            else if (token === this.primitives["+"]) {
                // add a blank string
                string.push("");
            }
            else {
                string.push(`[${token}]`);
            }
        }
        return string.join("+");
    }
    /**
     * Perform full simplification
     * @param code JavaScript code to simplify
     * @param autoEval Wrap with eval function
     */
    simplify(code, autoEval = false) {
        const output = this.stringify(this.tokenize(code));
        if (!autoEval)
            return output;
        // generate a Keyword for the eval function
        const evalToken = this.addToken("eval", '[]["fill"]["constructor"]("return eval")()');
        delete this.tree.eval;
        return `${evalToken}(${output})`;
    }
}
//# sourceMappingURL=Parser.js.map