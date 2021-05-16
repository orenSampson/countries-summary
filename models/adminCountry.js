const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminCountrySchema = new Schema({
  country: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isSelected: { type: Boolean, required: true },
});

module.exports = mongoose.model("AdminCountry", adminCountrySchema);
