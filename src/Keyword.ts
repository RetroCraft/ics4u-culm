/**
 * Represents a JavaScript keyword or token
 */
export abstract class Keyword {
  /**
   * Depth in tree.
   */
  public priority: number;
  /**
   * String representation.
   */
  public value: string;
  /**
   * Do the given keys return the literal eval(value) or String(value)
   */
  public returnsString = true;

  /**
   * String representation
   */
  public toString(): string {
    return "";
  }

  /**
   * Check for equality
   */
  public equals(other) {
    return this.value === other.value;
  }
}
