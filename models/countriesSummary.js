const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countriesSummary = new Schema({
    countries: [
        {
            countryName: { type: String, required: true },
            slug: { type: String, required: true, unique: true },
            totalConfirmed: { type: Number, required: true },
            newConfirmed: { type: Number, required: true },
            totalDeaths: { type: Number, required: true },
            totalRecovered: { type: Number, required: true },
        },
    ],
});

module.exports = mongoose.model("CountriesSummary", countriesSummary);
