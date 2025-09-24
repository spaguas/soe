function haversine(lat1, lon1, lat2, lon2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const RadiusSearchControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function () {
        const div = L.DomUtil.create('div', 'leaflet-bar');
        const btn = L.DomUtil.create('button', 'btn btn-secondary', div);
        btn.type = 'button';
        btn.title = 'Buscar por raio(km)';
        btn.innerHTML = '<span><i class="bi bi-bullseye"></i></span>';
        L.DomEvent.disableClickPropagation(div);
        btn.addEventListener('click', () => {
            const off = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('offRadiusSearch'));
            off.show();
        });
        return div;
    }
});