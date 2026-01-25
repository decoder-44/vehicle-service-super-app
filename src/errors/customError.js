import { ERROR_CODES } from "./errorCodes.js";
import { ERROR_MESSAGES } from "./errorMessages.js";

export class CustomError extends Error {
  constructor({ code, data = null, statusCode } = {}) {
    const finalCode = code ?? ERROR_CODES.INTERNAL_SERVER_ERROR;
    const message = ERROR_MESSAGES[finalCode] ?? ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR];

    super(message); // sets error.message
    this.name = "CustomError";

    this.code = finalCode;
    this.data = data;
    this.statusCode = statusCode ?? 500;

    Error.captureStackTrace?.(this, CustomError);
  }
}
