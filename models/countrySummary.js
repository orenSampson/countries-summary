const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countrySummary = new Schema({
  slug: { type: String, required: true, unique: true },
  countryData: [
    {
      date: { type: Date, required: true, unique: true },
      totalConfirmed: { type: Number, required: true },
      totalDeaths: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("CountrySummary", countrySummary);
