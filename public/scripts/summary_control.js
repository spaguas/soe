const summaryControl = L.Control.extend({
  options: { position: 'topright' },
  onAdd: function () {
    const container = L.DomUtil.create('div', 'leaflet-bar');
    const btn = L.DomUtil.create('button', 'btn btn-secondary', container);
    btn.id = 'summaryControlBtn';
    btn.type = 'button';
    btn.title = 'Abrir resumo dos resultados';
    btn.innerHTML = '<span><i class="bi bi-bar-chart-line-fill"></i></span>';
    L.DomEvent.disableClickPropagation(container);
    btn.addEventListener('click', () => {
      const offcanvasEl = document.getElementById('offSummary');
      if (!offcanvasEl) return;
      const instance = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
      instance.toggle();
    });
    return container;
  }
});

window.summaryControl = summaryControl;
