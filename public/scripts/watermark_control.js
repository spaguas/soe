// Watermark com logo no canto inferior direito

const WatermarkControl = L.Control.extend({
options: { position: 'bottomright' },
onAdd: function () {
    const div = L.DomUtil.create('div','watermark-logo');
    const img = L.DomUtil.create('img', '', div);

    if(!isMobile()){    
        console.log("Not mobile");
        div.style.background = 'transparent';
        div.style.padding = '5px';
        img.src = './logo-spaguas-colorido.png'; // caminho do seu logo PNG
        img.style.width = '150px';    // ajuste o tamanho aqui
        img.style.opacity = '0.9';
        img.style.pointerEvents = 'none'; // não bloqueia cliques no mapa
    }
    else{
        console.log("Is mobile");
        div.style.background = 'transparent';
        div.style.padding = '2px';

        const img = L.DomUtil.create('img', '', div);        
        img.src = './logo-spaguas-colorido.png'; // caminho do seu logo PNG
        img.style.width = '100px';    // ajuste o tamanho aqui
        img.style.opacity = '0.9';
        img.style.pointerEvents = 'none'; // não bloqueia cliques no mapa
    }

    return div;
}
});

// Função para trocar a watermark conforme o mapa base
function updateWatermark(isDark) {
    const imgs = document.querySelectorAll('.watermark-logo img');
    imgs.forEach(img => {
        if (img.src.includes('logo-spaguas')) {
            img.src = isDark ? 'logo-spaguas-branco.png' : 'logo-spaguas-colorido.png';
        }
    });
}

iconLayersControl.on('activelayerchange', function(e) {
    console.log('layer switched', e.layer);
    map.invalidateSize();

    let isDark = false;
    //Change watermakr logo with layer names is black
    if(e.layer._url.indexOf('black') > -1 || e.layer._url.indexOf('dark') > -1 || e.layer._url.indexOf('satelite') > -1 || e.layer._url.indexOf('satel') > -1){
      isDark = true;
    }

    updateWatermark(isDark);
});