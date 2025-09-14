var express = require('express');
var router = express.Router();
var elasticClient = require('../backend/elastic-client');
var municipios_json = require('../public/geojson/municipios.json');
var ugrhis_json = require('../public/geojson/ugrhis.json');

var axios = require('axios');
require("dotenv").config();

function escaparAspasDuplasInternas(obj) {
  if (typeof obj === 'string') {
    // Adapte esta lógica de escape conforme necessário
    return obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replaceAll("\'", "").trim();
  } else if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map(escaparAspasDuplasInternas);
    } else {
      const novoObj = {};
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          novoObj[key] = escaparAspasDuplasInternas(obj[key]);
        }
      }
      return novoObj;
    }
  } else {
    return obj;
  }
}

function tratarErroJson(jsonString) {
  //console.log("JSON String: ", jsonString);
  // Expressão regular para encontrar caracteres inválidos para JSON
  // Isso inclui caracteres de controle (U+0000-U+001F),
  // caracteres que podem causar problemas de encoding/parsing (como alguns emojis e símbolos),
  // e caracteres Unicode que não são bem suportados em JSON.
  // Uma abordagem mais restrita é remover apenas os caracteres de controle,
  // mas para uma limpeza mais agressiva, podemos usar uma faixa maior.
  // Adapte a regex conforme a necessidade específica dos seus dados.
  const regexCaracteresInvalidos = /[\u0000-\u001F\uD800-\uDFFF\uFEFF"\\'\\\\]/g;

  if (typeof jsonString !== 'string') {
    console.error("Erro: A entrada não é uma string.");
    return null; // Ou lance um erro, dependendo do seu caso de uso
  }

  // Remove os caracteres inválidos da string
  return jsonString.replace(regexCaracteresInvalidos, '');
}

router.get('/ugrhis/:cod_ugrhi', function(req,res,next){
  async function run(){
    console.log("Find Ugrhi: ", req.params);
    let features = [];

    for(let i = 0; i < ugrhis_json.features.length; i++){
      let element = ugrhis_json.features[i];

      if(element.properties.codigo == req.params['cod_ugrhi']){
        console.log("Element => ", element.properties.codigo," => ", req.params['cod_ugrhi']);
        features.push(element);
      }
    }

    res.render('ugrhis', {title: 'Localização Ugrhis', ugrhis: JSON.stringify(features[0])});
  }

  run().catch(console.log);
});

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
   
    res.render('municipios', { title: 'SOE', municipios: JSON.stringify(features[0]) });
  }
  run().catch(console.log);
})


// router.get('/api/list_outorgas/', function(req,res,next){
//   async function run(){
//     console.log("Starting Async Search => ", req.query);

//     const username = process.env.ELASTIC_USERNAME;
//     const password = process.env.ELASTIC_PASSWORD;

//     const elasticsearchUrl = 'https://cth.daee.sp.gov.br/elasticsearch';
//     const indexName = 'outorgas-soe';
//     //const pageSize = (req.query['size']) ? parseInt(req.query['size']) : 1000;
//     const pageSize = 1000;
//     outorgas = [];

//     var must_filter = [];
//     let geo_filter = {};
//     let date_filter = {};

//     for (var [key, value] of Object.entries(req.query)) {
//       if(value != ""){
        
//         var field_name = ""
        
//         if(key.indexOf("ugrhi")>-1 || key.indexOf("data_publicacao")>-1 || key.indexOf("latitude")>-1 || key.indexOf("longitude") > -1 || key.indexOf("distance") > -1 || key.indexOf("location") > -1){
//           field_name = key;
//         }
//         else{
//           field_name = key + ".keyword";
//         }

//         if(key.indexOf("data_publicacao") == -1 && key.indexOf("latitude") == -1 && key.indexOf("longitude") == -1 && key.indexOf("distance") == -1 && key.indexOf("location") == -1){
//           let obj = {};
//           obj[field_name]= value;
//           must_filter.push({match: obj});
//         }
//         else if(key.indexOf("data_publicacao") > -1){
//           let stx = field_name.split("_");
//           let obj = {};
//           obj[stx[2]] = value;
          
//           Object.assign(date_filter, obj);
//         }
//         else{
//           //Forcing unit distance in kilometers
//           if(field_name == "distance"){
//             value = value + "km";
//           }

//           let obj = {};
//           //geo_filter[field_name] = value;
//           obj[field_name] = value;
//           Object.assign(geo_filter, obj);
//         }
//       }
//     }
    
//     if(!isEmpty(geo_filter)){
//       console.log("GeoFilter: ", geo_filter);
//       must_filter.push({geo_distance: geo_filter});
//     }

//     if(!isEmpty(date_filter)){
//       console.log("DateFilter: ", date_filter);
//       let obj = {range: {data_publicacao: date_filter}};
//       console.log(obj);
//       must_filter.push(obj);
//     }

//     //var requestUrl = (req.params['scroll_id'] != "" && req.params['scroll_id'] != undefined) ? `${elasticsearchUrl}/${indexName}/_search/scroll?scroll=1m&scroll_id=${req.params['scroll_id']}` : `${elasticsearchUrl}/${indexName}/_search?scroll=1m`
    
//     var requestUrl = `${elasticsearchUrl}/${indexName}/_search?scroll=1m`;

//     var post_params = {size: pageSize };
//     console.log("Params: ", req.params);
//     console.log("Query: ", req.query['scroll_id']);

//     if(req.query['scroll_id'] != undefined && req.query['scroll_id'] != ''){
//       requestUrl = `${elasticsearchUrl}/_search/scroll`;
//       post_params = {scroll: '1m', scroll_id: req.query['scroll_id'] };
//     }else{
//       requestUrl = `${elasticsearchUrl}/${indexName}/_search?scroll=1m`;
//       post_params = {size: pageSize, query: { bool:{ must: must_filter } }}
//     }
    
//     console.log("Request: ", requestUrl);
//     console.log("Filter: ", must_filter)

//     axios.post(requestUrl, post_params,{
//         auth: {
//           username: username,
//           password: password,
//         },
//     }).then(function (response) {
//       hits = response.data.hits.hits;
//       totalHits = response.data.hits.total.value;
//       scrollId = response.data._scroll_id;
//       outorgas.push(...hits);

//       console.log('Total hits:', totalHits);
//       console.log('Search results:', hits.length);
//       console.log("Outorgas: "+outorgas.length+"/"+totalHits);
//       console.log('Scroll Id: '+scrollId);

//       res.status(200).json({
//         scrollId: scrollId,
//         total: totalHits,
//         size: hits.length,
//         outorgas: parserOutorgas(outorgas)
//       })
//       //res.status(200).json({})
//     }).catch(err => {
//       console.log("Error Elastic: ", err.response);
//       /*res.status(500).json({
//         error: err
//       })*/
//     })

//   }

//   run().catch(console.log);
// });

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
      const indexName = 'outorgas-soe';

      // Set pagination parameters
      const pageSize = 100; // Number of documents per page
      

      axios.post(`${elasticsearchUrl}/${indexName}/_search?scroll=1m`,{
        size: pageSize,
        _source: { 
          excludes:
          [
            "nome_completo", "bairro_endereco", "cpf", "nome", "nome_tecnico_pto",
            "username_tecnico_pto", "situacao_user_tecnico_pto"
          ]
        },
        query: {
          bool:{
            must: must_filter
          },
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
        //console.log("Scrolling to: ", scrollId);

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

              //outorgas = removerCampoPorCaminho(outorgas, "_source");

              res.render('index', { title: 'SOE', outorgas: JSON.stringify(escaparAspasDuplasInternas(outorgas)) });
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
      res.render('index', { title: 'SOE', outorgas: "" });
    }

    
  };

  run().catch(console.log);

  
});

router.get('/index_new', function(req, res, next) {
  async function run(){
    res.render('index_new', { title: 'SOE' });
  }

  run().catch(console.log);
})

router.get('/index_new2', function(req, res, next) {
  async function run(){
    res.render('index_new2', { title: 'SOE' });
  }

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

function getSazonalityTime(outorga, month, unit){
  let zeroMonth = String(""+month).padStart(2, '0');
  let keySazon = "minh";
  var ret;

  if(unit == "minutes"){
    keySazon = "minh";
    if((ret == null || ret == "") || parseInt(ret) <= 0){ ret = 60 }else{ret = outorga._source[keySazon+"_"+zeroMonth];}
  }
  else if(unit == "days"){
    keySazon = "dm"
    if((ret == null || ret == "") || parseInt(ret) <= 0){ ret = 30 }else{ret = outorga._source[keySazon+"_"+zeroMonth];}
  }
  else if(unit == "hours"){
    keySazon = "hd";
    if((ret == null || ret == "") || parseInt(ret) <= 0){ ret = 24}else{ret = outorga._source[keySazon+"_"+zeroMonth];}
  }
  
  return ret;
}

function getDischargeValue(outorga, month){
  let zeroMonth = String(""+month).padStart(2, '0');
  return outorga._source["vz_"+zeroMonth]
}

function calculateVolume(outorga, month){
  var minutes = getSazonalityTime(outorga, month, 'minutes');
  var hours   = getSazonalityTime(outorga, month, 'hours');
  var days    = getSazonalityTime(outorga, month, 'days');
  var discharge = getDischargeValue(outorga, month);

  return (((minutes/60) + hours) * days) * discharge;
}

function calculateTotalVolume(outorga){
  var total = 0;
  for(var i = 1; i <= 12; i++){
    //console.log(i," => ", calculateVolume(outorga, i));
    total += calculateVolume(outorga, i);
  }

  return total;
}


function parserOutorgas(outorgas){
  let rets = [];

  for(var i = 0; i < outorgas.length; i++){
    let outorga = outorgas[i];
    //console.log(outorga);

    rets.push({
      num_requerimento: outorga._id,
      portaria: outorga._source.portaria,
      processo: outorga._source.processo,
      latitude: outorga._source.latitude,
      longitude: outorga._source.longitude,
      nro_uso: outorga._source.nro_uso,
      tipo_uso: outorga._source.tipo_de_req_simplificado,
      subtipo_uso: outorga._source.tp_uso_subtipo1,
      finalidade: outorga._source.finalidade_1630,
      sazonal: (outorga._source.sazonalidade.indexOf(" NAO SAZONAL") > -1) ? false : true,
      ugrhi: outorga._source.ugrhi,
      subugrhi: outorga._source.subugrhi,
      municipio: {nome: outorga._source.municipio, cod_ibge: outorga._source.cod_ibge},
      diretoria: outorga._source.diretoria_req,
      data_publicacao: outorga._source.data_publicacao,
      volume_total: calculateTotalVolume(outorga),
      cnpj_requerente: (outorga._source.cnpj_requerente != undefined) ? outorga._source.cnpj_requerente : "***.***.***-**",
      status: outorga._source.decisao_pto,
      tipo_empreendimento: outorga._source.tipo_empreendimento,
      tipo_area: outorga._source.tipo_area,
      tipo_finalidade: outorga._source.tipo_finalidade_usos,
      tipo_planejamento: outorga._source.tipo_planejamento,
      tipo_requerimento: outorga._source.tipo_requerimento,
      data_publicacao: outorga._source.data_publicacao,
      data_exame: outorga._source.data_exame,     
      sazonalidade: {
        jan: [getSazonalityTime(outorga, 1, "minutes"),  getSazonalityTime(outorga, 1, "hours"),  getSazonalityTime(outorga, 1, "days"),  getDischargeValue(outorga, 1)],
        fev: [getSazonalityTime(outorga, 2, "minutes"),  getSazonalityTime(outorga, 2, "hours"),  getSazonalityTime(outorga, 2, "days"),  getDischargeValue(outorga, 2)],
        mar: [getSazonalityTime(outorga, 3, "minutes"),  getSazonalityTime(outorga, 3, "hours"),  getSazonalityTime(outorga, 3, "days"),  getDischargeValue(outorga, 3)],
        abr: [getSazonalityTime(outorga, 4, "minutes"),  getSazonalityTime(outorga, 4, "hours"),  getSazonalityTime(outorga, 4, "days"),  getDischargeValue(outorga, 4)],
        mai: [getSazonalityTime(outorga, 5, "minutes"),  getSazonalityTime(outorga, 5, "hours"),  getSazonalityTime(outorga, 5, "days"),  getDischargeValue(outorga, 5)],
        jun: [getSazonalityTime(outorga, 6, "minutes"),  getSazonalityTime(outorga, 6, "hours"),  getSazonalityTime(outorga, 6, "days"),  getDischargeValue(outorga, 6)],
        jul: [getSazonalityTime(outorga, 7, "minutes"),  getSazonalityTime(outorga, 7, "hours"),  getSazonalityTime(outorga, 7, "days"),  getDischargeValue(outorga, 7)],
        ago: [getSazonalityTime(outorga, 8, "minutes"),  getSazonalityTime(outorga, 8, "hours"),  getSazonalityTime(outorga, 8, "days"),  getDischargeValue(outorga, 8)],
        set: [getSazonalityTime(outorga, 9, "minutes"),  getSazonalityTime(outorga, 9, "hours"),  getSazonalityTime(outorga, 9, "days"),  getDischargeValue(outorga, 9)],
        out: [getSazonalityTime(outorga, 10, "minutes"), getSazonalityTime(outorga, 10, "hours"), getSazonalityTime(outorga, 10, "days"), getDischargeValue(outorga, 10)],
        nov: [getSazonalityTime(outorga, 11, "minutes"), getSazonalityTime(outorga, 11, "hours"), getSazonalityTime(outorga, 11, "days"), getDischargeValue(outorga, 11)],
        dez: [getSazonalityTime(outorga, 12, "minutes"), getSazonalityTime(outorga, 12, "hours"), getSazonalityTime(outorga, 12, "days"), getDischargeValue(outorga, 12)],
      }
    })
  }

  return rets;
}

module.exports = router;
