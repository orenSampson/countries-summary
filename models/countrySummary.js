const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countryDataSubSchema = new Schema(
  {
    date: { type: Date, required: true },
    totalConfirmed: { type: Number, required: true },
    totalDeaths: { type: Number, required: true },
  },
  { _id: false }
);

const countrySummary = new Schema({
  slug: { type: String, required: true },
  countryData: [countryDataSubSchema],
});

module.exports = mongoose.model("CountrySummary", countrySummary);
