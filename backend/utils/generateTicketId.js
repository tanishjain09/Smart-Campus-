const Counter = require("../model/Counter");

/**
 * Generates the next sequential issue ticket id using the shared counter
 * collection.
 *
 * @returns {Promise<string>} Ticket identifier in the form `CMP-000001`.
 */
module.exports = async function generateTicketId() {
  const counter = await Counter.findOneAndUpdate(
    { key: "issueTicketId" },
    { $inc: { value: 1 } },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  return `CMP-${String(counter.value).padStart(6, "0")}`;
};
