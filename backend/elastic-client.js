// backend/elastic-client.js
require("dotenv").config();

//Loading Elasticsearch Client
const { Client } = require('@elastic/elasticsearch');
const elasticClient = new Client({
  node: process.env.ELASTIC_ENDPOINT,
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
  maxRetries: 5,
  requestTimeout: 6000,
  //sniffOnStart: true,
  //proxy: process.env.ELASTIC_PROXY
});


module.exports = elasticClient;