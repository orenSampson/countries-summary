const mongoose = require("mongoose");

const { MONGODB_URI } = require("./constants");

exports.mergeSubCountries = (arr) => {
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

    compactedArr = compactedArr.map((element) => ({
      date: new Date(element.Date),
      totalConfirmed: element.Confirmed,
      totalDeaths: element.Deaths,
    }));

    return compactedArr;
  }

  return arr;
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

exports.waitInMilliSeconds = (milliseconds) => {
  return new Promise((resolve) =>
    setTimeout(
      () => resolve(`waited ${milliseconds} miliseconds `),
      milliseconds
    )
  );
};
