const access_token = "pk.eyJ1IjoiZGllZ29tb250ZWlyb3MiLCJhIjoiY21ldTh3ZWhhMDRoMDJzcHlpdWl2M2ViNCJ9.CufdrGmK_l_roZ66i4_R2g";
const baseLayers = [
    {
      title: 'OpenST', // use any string
      layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }), // any ILayer
      icon: './icons/openstreetmap_de.png' // 80x80 icon
    },
    {
      title: 'Cartas 1:50k', // use any string
      layer: L.tileLayer.wms('https://datageo.ambiente.sp.gov.br/geoimage/datageoimg/ows?SERVICE=WMS', {
        layers: 'Cartas_50k_IBGE'
      }), // any ILayer
      icon: './icons/cartas_ibge_50k.png' // 80x80 icon
    },
    {
      title: 'Mapbox Streets', // use any string
      layer: L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGllZ29tb250ZWlyb3MiLCJhIjoiY21ldTh3ZWhhMDRoMDJzcHlpdWl2M2ViNCJ9.CufdrGmK_l_roZ66i4_R2g", {
              maxZoom: 19,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              tileSize: 512,
              zoomOffset: -1
      }), // any ILayer
      icon: './icons/mapbox-streets.png' // 80x80 icon
    },
    {
      title: 'Mapbox Satélite', // use any string
      layer: L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGllZ29tb250ZWlyb3MiLCJhIjoiY21ldTh3ZWhhMDRoMDJzcHlpdWl2M2ViNCJ9.CufdrGmK_l_roZ66i4_R2g", {
              maxZoom: 19,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              tileSize: 256,
              zoomOffset: 0
      }), // any ILayer
      icon: './icons/mapbox-streets.png' // 80x80 icon
    },
    {
      title: 'Mapbox Dark', // use any string
      layer: L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGllZ29tb250ZWlyb3MiLCJhIjoiY21ldTh3ZWhhMDRoMDJzcHlpdWl2M2ViNCJ9.CufdrGmK_l_roZ66i4_R2g", {
              maxZoom: 19,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              tileSize: 256,
              zoomOffset: 0
      }), // any ILayer
      icon: './icons/mapbox-streets.png' // 80x80 icon
    }
]