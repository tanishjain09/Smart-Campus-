const ApiError = require("../utils/apiError");

/**
 * Runs a list of synchronous validators against the current request.
 *
 * @param {Array<(req: import("express").Request) => string|null>} validators Request validators.
 * @returns {import("express").RequestHandler}
 */
function validateRequest(validators) {
  return (req, res, next) => {
    const validationErrors = [];

    validators.forEach((validator) => {
      const errorMessage = validator(req);

      if (errorMessage) {
        validationErrors.push(errorMessage);
      }
    });

    if (validationErrors.length > 0) {
      return next(new ApiError(400, validationErrors.join("; ")));
    }

    return next();
  };
}

module.exports = validateRequest;
