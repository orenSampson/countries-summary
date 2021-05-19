const moment = require("moment");
const mongoose = require("mongoose");
const axios = require("axios");

const {
  MONGODB_URI,
  COVID_BASE_URL,
  INTERVAL_FROM_TO,
  BEGINING_DATE,
} = require("./constants");

const waitInMilliSeconds = (milliseconds) => {
  return new Promise((resolve, reject) =>
    setTimeout(() => reject(`waited ${milliseconds} miliseconds`), milliseconds)
  );
};

const func1 = async () => {
  try {
    await waitInMilliSeconds(2000);
  } catch (error) {
    console.log("error of func1");
    console.log("error :>> ", error);
  }
};

exports.app = async () => {
  console.log("running app of test.js");

  const from = moment(BEGINING_DATE);
  const to = moment().subtract(1, "days");

  console.log("days different from to :>> ", to.diff(from, "days"));
};
