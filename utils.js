const mongoose = require("mongoose");
const axios = require("axios");
const moment = require("moment");

const {
  MONGODB_URI,
  COVID_BASE_URL,
  INTERVAL_FROM_TO,
} = require("./constants");

const mergeSubCountries = (arr) => {
  if (arr.length > 1) {
    let compactedArr = [];
    compactedArr.push(arr[0]);
    for (let i = 1; i < arr.length; i++) {
      if (compactedArr[compactedArr.length - 1].Date === arr[i].Date) {
        compactedArr[compactedArr.length - 1].Confirmed += arr[i].Confirmed;
        compactedArr[compactedArr.length - 1].Deaths += arr[i].Deaths;
      } else {
        compactedArr.push(arr[i]);
      }
    }

    arr = compactedArr;
  }

  arr = arr.map((element) => ({
    date: new Date(element.Date),
    totalConfirmed: element.Confirmed,
    totalDeaths: element.Deaths,
  }));

  return arr;
};

const waitInMilliSeconds = (milliseconds) => {
  return new Promise((resolve) =>
    setTimeout(
      () => resolve(`waited ${milliseconds} miliseconds `),
      milliseconds
    )
  );
};

exports.connectToDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log("connection successful");
  } catch (error) {
    console.log(error);
  }
};

exports.fillDataFromTo = async (from, to, slug) => {
  let tempTo, countriesAxios, returnArr;
  tempTo = countriesAxios = null;
  returnArr = [];

  // one second added for case that from and to are the
  // same date so time of from and to need to be different
  // for the covid19 api not to fail
  to.utcOffset(0).set({
    hour: 0,
    minute: 0,
    second: 1,
    millisecond: 0,
  });

  while (from.isSameOrBefore(to)) {
    if (to.diff(from, "days") >= INTERVAL_FROM_TO) {
      tempTo = moment(from).add(INTERVAL_FROM_TO, "days");
    } else {
      tempTo = moment(to);
    }

    countriesAxios = null;
    await waitInMilliSeconds(3000);
    try {
      console.log(
        "fillDataFromTo - from.toISOString() :>> ",
        from.toISOString()
      );
      console.log(
        "fillDataFromTo - tempTo.toISOString() :>> ",
        tempTo.toISOString()
      );

      countriesAxios = await axios.get(
        `${COVID_BASE_URL}/country/${slug}?from=${from.toISOString()}&to=${tempTo.toISOString()}`
      );
    } catch (error) {
      console.log("error :>> ", error);
      return returnArr;
    }

    countriesAxios = mergeSubCountries(countriesAxios.data);

    console.log("fillDataFromTo - countriesAxios :>> ", countriesAxios);
    returnArr.push(...countriesAxios);

    from = moment(tempTo).add(1, "days");
  }

  return returnArr;
};
