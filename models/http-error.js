class HttpError extends Error {
  construtor(message, errorCode) {
    super(message); // Add a "message" property to the error object
    this.code = errorCode; // Add a "code" property to the error object
  }
}

module.exports = HttpError;
