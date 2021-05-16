const axios = require("axios");
const moment = require("moment");

const CountriesSummary = require("./models/countriesSummary");
const CountrySummary = require("./models/countrySummary");
const AdminCountry = require("./models/adminCountry");
const {
  COVID_BASE_URL,
  BEGINING_DATE,
  INTERVAL_FROM_TO,
} = require("./constants");
const {
  connectToDB,
  mergeSubCountries,
  waitInMilliSeconds,
} = require("./utils");

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

const updateCountrySummary = async () => {
  let slug, from, tempTo, to, countriesAxios, countrySummary;

  console.log("running updateCountrySummary");

  let adminSelectedCountries;
  try {
    adminSelectedCountries = await AdminCountry.find({
      isSelected: true,
    }).lean();
  } catch (error) {
    return console.log("error :>> ", error);
  }
  if (!adminSelectedCountries) {
    return console.log("error :>> ", error);
  }

  for (const country of adminSelectedCountries) {
    slug = country.slug;

    console.log("slug :>> ", slug);

    countrySummary = null;
    from = null;
    tempTo = null;
    to = null;
    countriesAxios = null;
    try {
      countrySummary = await CountrySummary.findOne({ slug: slug });
    } catch (error) {
      console.log("error :>> ", error);
      continue;
    }

    if (countrySummary && countrySummary.countryData.length) {
      const lastElementIndex = countrySummary.countryData.length - 1;
      const mostRecentDate = countrySummary.countryData[lastElementIndex].date;
      from = moment(mostRecentDate).add(1, "days");
    } else {
      from = moment(BEGINING_DATE);
      countrySummary = new CountrySummary({ slug: slug, countryData: [] });
    }

    // one second added for case that from and to are the
    // same date so time of from and to need to be different
    // for the covid19 api not to fail
    to = moment()
      .utcOffset(0)
      .set({
        hour: 0,
        minute: 0,
        second: 1,
        millisecond: 0,
      })
      .subtract(1, "days");

    console.log("from :>> ", from.toISOString());
    console.log("to :>> ", to.toISOString());
    console.log("-------------------------------------------");

    while (from.isSameOrBefore(to)) {
      if (to.diff(from, "days") >= INTERVAL_FROM_TO) {
        tempTo = moment(from).add(INTERVAL_FROM_TO, "days");
      } else {
        tempTo = moment(to);
      }

      countriesAxios = null;
      try {
        await waitInMilliSeconds(1000);
        countriesAxios = await axios.get(
          `${COVID_BASE_URL}/country/${slug}?from=${from.toISOString()}&to=${tempTo.toISOString()}`
        );
        countriesAxios = mergeSubCountries(countriesAxios.data);

        console.log("countriesAxios :>> ", countriesAxios);

        countrySummary.countryData.push(...countriesAxios);

        console.log(
          "countrySummary.countryData :>> ",
          countrySummary.countryData
        );
      } catch (error) {
        console.log("error :>> ", error);
        break;
      }

      from = moment(tempTo).add(1, "days");

      console.log("+++++++++++++++++++++++++++++++++++++++++++");
    }

    if (countrySummary.countryData.length) {
      console.log(
        "countrySummary.countryData final :>> ",
        countrySummary.countryData
      );
      try {
        await countrySummary.save();
        console.log("save successful");
      } catch (error) {
        console.log("error :>> ", error);
      }
    }
  }
};

exports.app = async () => {
  console.log("running app of app.js");

  await connectToDB();

  // await updateCountriesSummary();

  await updateCountrySummary();
};
