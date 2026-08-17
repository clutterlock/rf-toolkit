/**
 * Thrown when a calculation receives a physically or numerically invalid
 * input. The message names the offending field.
 */
export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInputError";
  }
}
