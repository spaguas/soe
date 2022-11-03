var express = require('express');
var router = express.Router();
var elasticClient = require('../backend/elastic-client');

/* GET home page. */
router.get('/', function(req, res, next) {

  async function run(){

    console.log("Starting Async Search => ",req.query);
    let rsts = [];
    let outorgas = [];
    let must_filter = [];
    let geo_filter = {};

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

          if(key.indexOf("latitude") == -1 && key.indexOf("longitude") == -1 && key.indexOf("distance") == -1 && key.indexOf("location")){
            let obj = {};
            obj[field_name]= value;
            must_filter.push({match: obj});
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
      }
      
      if(!isEmpty(geo_filter)){
        console.log("GeoFilter: ", geo_filter);
        must_filter.push({geo_distance: geo_filter});
      }

      console.log("Filter: ", must_filter);

      const rst = await elasticClient.search({
        index: 'outorgas',
        // keep the search results "scrollable" for 30 seconds
        scroll: '10s',
        // for the sake of this example, we will get only one result per search
        size: 10,
        // filter the source to only include the quote field
        //_source: ['uid','latitude','longitude','decisao_pto','diretoria_req','finalidade_1630'],
        query: {
          bool:{
            must: must_filter
          }
        }
      });

      console.log("Result: ",rst);
      rsts.push(rst);

      while(rsts.length){
        const body = rsts.shift();

        //console.log("Body: ", body);
        body.hits.hits.forEach(function(hit){
          //console.log(hit);
          outorgas.push(hit);
        });

        // check to see if we have collected all of the quotes
        if (body.hits.total.value === outorgas.length) {
          //console.log('Outorgas Carregadas', outorgas);
          
          res.render('index', { title: 'SOE-DAEE', outorgas: JSON.stringify(outorgas).replaceAll("&#34;","\"") });
          break
        }

        // get the next response if there are more quotes to fetch
        rsts.push(
          await elasticClient.scroll({
            scroll_id: body._scroll_id,
            scroll: '10s'
          })
        );

      }
    }
    else{
      //console.log("Selecione um municipio para continuar...");
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
