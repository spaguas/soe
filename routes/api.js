var express = require('express');
var router = express.Router();
var esClient = require('../backend/elastic-https-client');
var municipios_json = require('../public/geojson/municipios.json');
var ugrhis_json = require('../public/geojson/ugrhis.json');

const index_name = 'outorgas-soe';

var axios = require('axios');
require("dotenv").config();

router.get('/', function(req, res, next) {
  res.json({ message: 'API is working' });
});

/**
 * Method to search outorgas by id
 */
// router.get('/outorgas/:id/', async function(req, res, next) {
//     const id = req.params.id;

//     esClient.getDocument(index_name, id)
//     .then((response) => {
//         console.log(`Found outorga with id: ${id}`);
//         res.json(response);
//     })
//     .catch((error) => {
//         console.error(`Error searching outorga with id: ${id}`, error);
//         res.status(500).json({ error: 'Error searching outorga', message: error });
//     });   
// });

router.get('/outorgas/all', async function(req, res, next) {

    const {fields} = req.query;

    let body = {
        "size": 1000,
        "query": {
            "match_all": {}
        }
    };

    if(fields) {
        body._source = fields.split(',');
    }

    esClient.searchWithScroll(index_name, body, '1m')
    .then((response) => {
        console.log(`Scroll search completed`);
        res.json(response);
    })
    .catch((error) => {
        console.error(`Error performing scroll search`, error);
        res.status(500).json({ error: 'Error searching outorgas', message: error.message });
    });
});

router.get('/outorgas/scroll_list', async function(req, res, next) {
    const scrollId = req.params.scroll_id || req.query.scroll_id;
    console.log(`Scroll ID: `, scrollId);
    if (!scrollId) {
        return res.status(400).json({ error: 'scroll_id parameter is required' });
    }

    esClient.scroll(scrollId, '1m')
    .then((response) => {
        console.log(`Scroll search with scroll_id completed`);
        res.json(response);
    })
    .catch((error) => {
        console.error(`Error performing scroll search with scroll_id`, error);
        res.status(500).json({ error: 'Error searching outorgas', message: error.message });
    });
})

router.get('/outorgas/all_pit', async function(req, res, next) {
    let pit_id;
    let totalDocs = 0;
    let searchAfter = null;

    try{
        pit_id = await esClient.getPIT(index_name);

        console.log("PIT created:", pit_id);

        if(!pit_id) {
            throw new Error('Failed to create PIT');
        }

        while(true) {
            const query = {
                size: 1000,
                sort: [{"id": "asc"},{ "_shard_doc": "asc" }],
                query: { "match_all": {} }
            }

            if(searchAfter) {
                query.search_after = searchAfter;
            }

            const response = await esClient.searchWithPIT(pit_id, query);
            const hits = response.hits.hits;

            if(hits.length === 0) {
                console.log(`All documents retrieved. Total: ${totalDocs}`);
                break;
            }

            for(const doc of hits) {
                console.log(doc);
            }

            searchAfter = hits[hits.length - 1].sort;
            totalDocs += hits.length;
            console.log(`Retrieved ${hits.length} documents, total so far: ${totalDocs}`);
        }
    }catch(error) {
        console.error('Error during PIT search:', error);
        return res.status(500).json({ error: 'Error searching outorgas', message: error.message });
    }finally {
        if(pit_id) {
            try{
                await esClient.closePIT(pit_id);
                console.log(`PIT closed: ${pit_id}`);
            }catch(error) {
                console.error(`Error closing PIT: ${pit_id}`, error);
            }
        }
    }


})

module.exports = router;