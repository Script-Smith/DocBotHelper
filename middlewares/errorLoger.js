class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
  
      // Capturing the stack trace keeps the reference to the constructor
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = ErrorHandler;
  