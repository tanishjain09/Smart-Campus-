const test = require("node:test");
const assert = require("node:assert/strict");
const asyncHandler = require("../utils/asyncHandler");

test("asyncHandler forwards async errors to next", async () => {
  const expectedError = new Error("boom");
  let forwardedError;

  const handler = asyncHandler(async () => {
    throw expectedError;
  });

  await handler({}, {}, (error) => {
    forwardedError = error;
  });

  assert.equal(forwardedError, expectedError);
});
