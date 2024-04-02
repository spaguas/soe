var express = require('express');
var router = express.Router();
var elasticClient = require('../backend/elastic-client');
var municipios_json = require('../public/geojson/municipios.json');

var axios = require('axios');
require("dotenv").config();

router.get('/municipios/:cod_ibge', function(req,res,next){

  async function run(){
    console.log("Search Municipios...");

    let features = [];
    console.log("Params: ", req.params);
   
    for(let i = 0; i < municipios_json.features.length; i++){
      let element = municipios_json.features[i];
      
      if(element.properties.codarea == req.params['cod_ibge']){
        console.log("Element => ", element.properties.codarea," => ", req.params['cod_ibge']);
        features.push(element);
      }
    }
   
    res.render('municipios', { title: 'SOE-DAEE', municipios: JSON.stringify(features[0]) });
  }
  run().catch(console.log);
})


/* GET home page. */
router.get('/', function(req, res, next) {

  async function run(){

    console.log("Starting Async Search => ",req.query);

    let outorgas = [];
    let must_filter = [];
    let geo_filter = {};
    let date_filter = {};

    // Basic Authentication credentials
    const username = process.env.ELASTIC_USERNAME;
    const password = process.env.ELASTIC_PASSWORD;
    
    let scrollId = null; // Scroll ID for subsequent requests

    let totalHits;
    let hits;

    if(!isEmpty(req.query)){

      for (var [key, value] of Object.entries(req.query)) {
        if(value != ""){
          
          var field_name = ""
          
          if(key.indexOf("ugrhi")>-1 || key.indexOf("data_publicacao")>-1 || key.indexOf("latitude")>-1 || key.indexOf("longitude") > -1 || key.indexOf("distance") > -1 || key.indexOf("location") > -1){
            field_name = key;
          }
          else{
            field_name = key + ".keyword";
          }

          if(key.indexOf("data_publicacao") == -1 && key.indexOf("latitude") == -1 && key.indexOf("longitude") == -1 && key.indexOf("distance") == -1 && key.indexOf("location") == -1){
            let obj = {};
            obj[field_name]= value;
            must_filter.push({match: obj});
          }
          else if(key.indexOf("data_publicacao") > -1){
            let stx = field_name.split("_");
            let obj = {};
            obj[stx[2]] = value;
            
            Object.assign(date_filter, obj);
          }
          else{
            //Forcing unit distance in kilometers
            if(field_name == "distance"){
              value = value + "km";
            }

            let obj = {};
            //geo_filter[field_name] = value;
            obj[field_name] = value;
            Object.assign(geo_filter, obj);
          }
        }
        /*else{
          console.error("Value is empty => ", value);
        }*/
      }
      
      if(!isEmpty(geo_filter)){
        console.log("GeoFilter: ", geo_filter);
        must_filter.push({geo_distance: geo_filter});
      }

      if(!isEmpty(date_filter)){
        console.log("DateFilter: ", date_filter);
        let obj = {range: {data_publicacao: date_filter}};
        console.log(obj);
        must_filter.push(obj);
      }

      console.log("Filter: ", must_filter);

      // Elasticsearch URL
      const elasticsearchUrl = 'https://cth.daee.sp.gov.br/elasticsearch';
      const indexName = 'outorgas';

      // Set pagination parameters
      const pageSize = 10; // Number of documents per page
      

      axios.post(`${elasticsearchUrl}/${indexName}/_search?scroll=1m`,{
        size: pageSize,
        query: {
          bool:{
            must: must_filter
          }
        },
      },{
          auth: {
            username: username,
            password: password,
          },
      }).then(function (response) {

        // Handle the initial search response
        hits = response.data.hits.hits;
        totalHits = response.data.hits.total.value;
        scrollId = response.data._scroll_id;
        
        console.log('Total hits:', totalHits);
        console.log('Search results:', hits.length);
        console.log("Outorgas: "+outorgas.length+"/"+totalHits);
        console.log('Scroll Id: '+scrollId);

        outorgas.push(...hits);
        
        performScrollRequest(scrollId, totalHits);
        
        

      }).catch(error => {
        // Handle the error
        console.error('Error performing search:', error);
      });

      // Perform subsequent scroll requests for pagination
      function performScrollRequest(scrollId, totalHits) {
        console.log("Scrolling to: ", scrollId);

        axios.post(`${elasticsearchUrl}/_search/scroll`, {
          scroll: '1m',
          scroll_id: scrollId,
        },{
          auth: {
            username: username,
            password: password,
          },
        }).then(response => {
            // Handle the scroll response
            const hits = response.data.hits.hits;

            //console.log('Scroll results:', hits);
            outorgas.push(...hits);
            
            // If there are more records, fetch them recursively
            if (outorgas.length < totalHits) {
              console.log("Loading => "+outorgas.length+"/"+totalHits);
              scrollId = response.data._scroll_id;
              performScrollRequest(scrollId, totalHits);
            }else{           
              //cleanUpScrollContext(scrollId);
              console.log("Render Outorgas Page");
              res.render('index', { title: 'SOE-DAEE', outorgas: JSON.stringify(outorgas).replaceAll("&#34;","\"") });
            }
          })
          .catch(error => {
            // Handle the error
            console.error('Error performing scroll:', error);
          });
      }

      // Clean up the scroll context
      function cleanUpScrollContext(scrollId) {
        console.log('Scroll context cleaned up');
        axios.delete(`${elasticsearchUrl}/_search/scroll`, {
          data: { scroll_id: scrollId },
        },{
          auth: {
            username: username,
            password: password,
          },
        })
          .then(response => {
            // Handle the scroll cleanup response
            console.log('Scroll context cleaned up');
          })
          .catch(error => {
            // Handle the error
            console.error('Error cleaning up scroll context:', error);
          });
      }
    }
    else{
      //console.log("Selecione um municipio para continuar...");
      //res.render('home/index', { title: 'SOE-DAEE', outorgas: "" });
      res.render('index', { title: 'SOE-DAEE', outorgas: "" });
    }

    
  };

  run().catch(console.log);

  
});

function isEmpty(obj) {
  for(var prop in obj) {
    if(Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

module.exports = router;
