require("dotenv").config();

const NodeGeocoder = require('node-geocoder');

const options = {
  provider: process.env.APP_GEOCODER_PROVIDER,
 // fetch: customFetchImplementation,
  apiKey: process.env.APP_GEOCODER_API,
  formatter: null 
};

const geocoder = NodeGeocoder(options);
 
module.exports = geocoder;