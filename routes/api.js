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

router.get('/outorgas/filter', async function(req, res, next) {
    try {
        const {
            fields,
            ugrhi,
            municipio,
            tipo_uso,
            tipo_finalidade_grupo,
            data_publicacao,
            diretoria,
            status_uso,
            status_req,
            sol_req_num,
            tem_sazonalidade,
            lat,
            lon,
            distance_km
        } = req.query;

        const filters = [];

        if (ugrhi) {
            const ugrhiCode = parseInt(ugrhi, 10);
            if (!Number.isNaN(ugrhiCode)) {
                filters.push({ term: { cod_ugrhi: ugrhiCode } });
            }
        }

        if (municipio) {
            filters.push({ term: { cod_ibge: municipio } });
        }

        if (tipo_uso) {
            filters.push({ term: { 'tipo_uso.keyword': tipo_uso } });
        }

        if (tipo_finalidade_grupo) {
            filters.push({ term: { 'tipo_finalidade_grupo.keyword': tipo_finalidade_grupo } });
        }

        if (diretoria) {
            filters.push({ term: { 'diretoria_nome.keyword': diretoria } });
        }

        if (data_publicacao) {
            filters.push({ range: { data_publicacao: { gte: data_publicacao } } });
        }

        const statusUsoValue = typeof status_uso === 'string' ? status_uso.trim() : '';
        if (statusUsoValue) {
            filters.push({ term: { 'status_uso.keyword': statusUsoValue } });
        }

        const statusReqValue = typeof status_req === 'string' ? status_req.trim() : '';
        if (statusReqValue) {
            filters.push({ term: { 'status_req.keyword': statusReqValue } });
        }

        const solReqValue = typeof sol_req_num === 'string' ? sol_req_num.trim() : '';
        if (solReqValue) {
            filters.push({ term: { 'sol_req_num_cod.keyword': solReqValue } });
        }

        if (tem_sazonalidade === 'true' || tem_sazonalidade === 'false') {
            filters.push({ term: { tem_sazonalidade: tem_sazonalidade === 'true' } });
        }

        if (lat && lon && distance_km) {
            const distanceValue = parseFloat(distance_km);
            const latValue = parseFloat(lat);
            const lonValue = parseFloat(lon);
            if (!Number.isNaN(distanceValue) && !Number.isNaN(latValue) && !Number.isNaN(lonValue)) {
                filters.push({
                    geo_distance: {
                        distance: `${distanceValue}km`,
                        location: {
                            lat: latValue,
                            lon: lonValue
                        }
                    }
                });
            }
        }

        if (!filters.length) {
            return res.status(400).json({ error: 'Nenhum filtro informado' });
        }

        const body = {
            size: 1000,
            query: {
                bool: {
                    filter: filters
                }
            }
        };

        if (fields) {
            body._source = fields.split(',');
        }

        const response = await esClient.searchWithScroll(index_name, body, '1m');
        res.json(response);
    } catch (error) {
        console.error('Error performing filtered search', error);
        res.status(500).json({ error: 'Error filtering outorgas', message: error.message });
    }
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
