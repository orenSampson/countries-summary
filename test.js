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

const updateCountrySummary = async () => {
  const slug = "united-states";

  let countrySummary;
  try {
    countrySummary = await CountrySummary.findOne({ slug: slug });
  } catch (error) {
    console.log("error :>> ", error);
    return;
  }

  console.log("countrySummary :>> ", countrySummary);

  let from, tempTo, to, countriesAxios;

  if (countrySummary && countrySummary.countryData.length) {
    const mostRecentDate =
      countrySummary.countryData[countrySummary.countryData.length - 1].date;
    from = moment(mostRecentDate).add(1, "days");
  } else {
    from = moment(BEGINING_DATE);
    countrySummary = new CountrySummary({ slug: slug, countryData: [] });
  }

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
    if (to.diff(from, "days") >= 6) {
      tempTo = moment(from).add(6, "days");
    } else {
      tempTo = moment(to);
    }

    console.log("tempFrom :>> ", from.toISOString());
    console.log("tempTo :>> ", tempTo.toISOString());
    try {
      countriesAxios = await axios.get(
        `${COVID_BASE_URL}/country/${slug}?from=${from.toISOString()}&to=${tempTo.toISOString()}`
      );
      countriesAxios = mergeSubCountries(countriesAxios.data);

      // console.log("countriesAxios :>> ", countriesAxios);

      countrySummary.countryData.push(...countriesAxios);

      // console.log(
      //   "countrySummary.countryData :>> ",
      //   countrySummary.countryData
      // );
    } catch (error) {
      console.log("error :>> ", error);
      break;
    }

    from = moment(tempTo).add(1, "days");

    console.log("+++++++++++++++++++++++++++++++++++++++++++");
  }

  if (countrySummary.countryData.length) {
    // console.log(
    //   "countrySummary.countryData final :>> ",
    //   countrySummary.countryData
    // );
    try {
      await countrySummary.save();
    } catch (error) {
      console.log("error :>> ", error);
    }
  }
};

exports.app = async () => {
  console.log("running app of test.js");
  // await connectToDB();
  // await updateCountrySummary();
  // const res = await waitInMilliSeconds(3000);
  // console.log("res :>> ", res);
  // const countrySummary = new CountrySummary({
  //   slug: "armenia",
  //   countryData: [
  //     { date: "2021-05-16T00:00:00Z", totalConfirmed: 0, totalDeaths: 0 },
  //     { date: "2021-05-17T00:00:00Z", totalConfirmed: 0, totalDeaths: 0 },
  //   ],
  // });
  // try {
  //   await countrySummary.save();
  //   console.log("save successful");
  // } catch (error) {
  //   console.log("error :>> ", error);
  // }
};
