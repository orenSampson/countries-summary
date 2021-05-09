const mongoose = require("mongoose");
const axios = require("axios");

const CountriesSummary = require("./models/countriesSummary");
const { MONGODB_URI, COVID_BASE_URL } = require("./constants");

const connectToDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  } catch (error) {
    console.log(error);
  }
};

const updateCountriesSummary = async () => {
  let countriesSummary;
  try {
    countriesSummary = await axios.get(COVID_BASE_URL + "/summary");
    countriesSummary = countriesSummary.data.Countries;
  } catch (error) {
    return console.log(error);
  }

  if (!countriesSummary) {
    return console.log("error retrieving countries summary");
  }

  countriesSummary = countriesSummary.map((country) => ({
    countryName: country.Country,
    slug: country.Slug,
    totalConfirmed: country.TotalConfirmed,
    newConfirmed: country.NewConfirmed,
    totalDeaths: country.TotalDeaths,
    totalRecovered: country.TotalRecovered,
  }));

  const countriesObj = {
    countries: countriesSummary,
  };

  CountriesSummary.estimatedDocumentCount(async function (err, count) {
    if (err) {
      console.log(err);
    } else {
      if (count === 0) {
        const countriesSummaryCollection = new CountriesSummary(countriesObj);
        try {
          await countriesSummaryCollection.save();
        } catch (error) {
          console.log("error :>> ", error);
        }
      } else {
        try {
          await CountriesSummary.findOneAndUpdate({}, countriesObj);
        } catch (error) {
          console.log("error :>> ", error);
        }
      }
    }
  });
};

// const updateCountrySummary = async () => {};

exports.app = async () => {
  await connectToDB();

  await updateCountriesSummary();

  // let adminSelectedCountries;
  // try {
  //   adminSelectedCountries = await AdminCountry.find({
  //     isSelected: true,
  //   }).lean();
  // } catch (error) {
  //   return console.log("error retrieving admin countries");
  // }
  // if (!adminSelectedCountries) {
  //   return console.log("error retrieving admin countries");
  // }

  // console.log("adminSelectedCountries :>> ", adminSelectedCountries);

  // const adminSelectedCountriesSlugs = new Set(
  //   adminSelectedCountries.map(({ slug }) => slug)
  // );

  // console.log("countriesSummary before :>> ", countriesSummary);

  // countriesSummary = countriesSummary.filter(({ slug }) =>
  //   adminSelectedCountriesSlugs.has(slug)
  // );

  // console.log("countriesSummary after :>> ", countriesSummary);
};
