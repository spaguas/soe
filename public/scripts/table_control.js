const tableControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function () {
        const div = L.DomUtil.create('div', 'leaflet-bar');
        const btn = L.DomUtil.create('button', 'btn btn-secondary', div);
        btn.id = 'tableControlBtn';
        btn.type = 'button';
        btn.title = 'Abrir tabela de dados';
        btn.innerHTML = '<span><i class="bi bi-table"></i></span>';
        L.DomEvent.disableClickPropagation(div);
        btn.addEventListener('click', () => {
            /*const off = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('modalTable'));
            off.show();*/
            const myModalAlternative = new bootstrap.Modal('#modalTable', {})
            myModalAlternative.show();
        });
        return div;
    }
});
