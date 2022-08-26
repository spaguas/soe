var express = require('express');
var router = express.Router();
var elasticClient = require('../backend/elastic-client');

/* GET home page. */
router.get('/', function(req, res, next) {

  async function run(){
    console.log("Starting Async Search");
    let rsts = [];
    let outorgas = [];

    const rst = await elasticClient.search({
      index: 'outorgas',
      // keep the search results "scrollable" for 30 seconds
      scroll: '10s',
      // for the sake of this example, we will get only one result per search
      size: 10,
      // filter the source to only include the quote field
      //_source: ['uid','latitude','longitude','vz_1'],
      query: {
        match_all: {}
      } 
    });

    console.log("Result: ",rst);

    rsts.push(rst);

    while(rsts.length){
      const body = rsts.shift();

      console.log("Body: ", body);
      body.hits.hits.forEach(function(hit){
        console.log(hit);
        outorgas.push(hit);
      });

      // check to see if we have collected all of the quotes
      if (body.hits.total.value === outorgas.length) {
        //console.log('Outorgas Carregadas', outorgas);
        
        res.render('index', { title: 'SOE-DAEE', outorgas: JSON.stringify(outorgas).replaceAll("&#34;","\"")});
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
  };

  run().catch(console.log);

  
});

module.exports = router;
