const MapProgress = L.Control.extend({
    options: { position: 'bottomleft' },
    onAdd: function () {
        const wrap = L.DomUtil.create('div', 'leaflet-control leaflet-progress-control');
        wrap.style.display = 'none';
        wrap.innerHTML = `<div class="lp-bar"><div class="lp-bar-fill"></div></div><div class="lp-text small"></div>`;
        L.DomEvent.disableClickPropagation(wrap);
        this._wrap = wrap;
        this._fill = wrap.querySelector('.lp-bar-fill');
        this._text = wrap.querySelector('.lp-text');
        return wrap;
    },
    setProgress: function (value) {
        this._fill.style.width = value + '%';
        this._text.textContent = value + '%';
    }
});

/** criando instancia do componente de progresso no mapa */
const mapProgress = new MapProgress();

function mpShow(pct = 0, text = 'Carregando...') {
    if (!mapProgress._wrap) return;
    mapProgress._wrap.style.display = 'block';
    if (mapProgress._fill) mapProgress._fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    if (mapProgress._text) mapProgress._text.textContent = text;
}
function mpSet(pct, text) {
    if (!mapProgress._wrap) return;
    if (typeof pct === 'number' && mapProgress._fill) mapProgress._fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    if (typeof text === 'string' && mapProgress._text) mapProgress._text.textContent = text;
    mapProgress._wrap.style.display = 'block';
}
function mpHide() { if (mapProgress._wrap) mapProgress._wrap.style.display = 'none'; }