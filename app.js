(function () {
  'use strict';

  const BELGRADE = [44.8185, 20.4605];
  const OPACITY = {
    Established: 1,
    Renovated: 1,
    Damaged: 0.7,
    'Changed function': 0.5,
    Abandoned: 0.2,
    Demolished: 0
  };

  let mosqueAbout = [];
  let mosquesDecades = [];
  let map = null;
  let markersLayer = null;
  let selectedMosque = null;

  function driveThumbnail(url) {
    if (!url || !url.trim()) return null;
    const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w300` : url;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function getDecadeEvent(mosqueName, decade) {
    return mosquesDecades.find(
      (e) => e.mosque_name === mosqueName && e.decade === decade
    ) || {};
  }

  function filterByDecade(decade) {
    return mosqueAbout.filter((m) => {
      const built = m.decade_built != null ? m.decade_built : 0;
      const demolished = m.decade_demolished;
      const stillStanding = demolished == null || demolished === '';
      return built <= decade && (stillStanding || demolished >= decade);
    });
  }

  function renderPopup(mosque, event) {
    const name = escapeHtml(mosque.mosque_name);
    const what = escapeHtml(event.what_happened || '');
    const how = escapeHtml(event.how || '');
    const imgUrl = driveThumbnail(mosque.image_url);
    let html = `<div class="popup-title">${name}</div>`;
    if (imgUrl) {
      html += `<img class="popup-img" src="${escapeHtml(imgUrl)}" alt="">`;
    }
    if (what) {
      html += `<div class="popup-status"><strong>Status:</strong> ${what}</div>`;
    }
    if (how) {
      html += `<div class="popup-how">${how}</div>`;
    }
    return html;
  }

  function updateMap(decade) {
    if (!map || !markersLayer) return;
    markersLayer.clearLayers();
    const filtered = filterByDecade(decade);

    filtered.forEach((mosque) => {
      const event = getDecadeEvent(mosque.mosque_name, decade);
      const what = event.what_happened || '';
      const opacity = OPACITY[what] != null ? OPACITY[what] : 1;
      if (opacity <= 0) return;

      const isSelected = selectedMosque === mosque.mosque_name;
      const color = isSelected ? '#FF4B4B' : '#191A1A';
      const radius = isSelected ? 14 : 10;

      const marker = L.circleMarker([mosque.latitude, mosque.longitude], {
        radius,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: opacity
      });

      const popupContent = renderPopup(mosque, event);
      marker.bindPopup(popupContent, {
        maxWidth: 320,
        minWidth: 200
      });
      marker.bindTooltip(mosque.mosque_name, {
        permanent: false,
        direction: 'top'
      });
      markersLayer.addLayer(marker);
    });
  }

  function renderCards(decade) {
    const container = document.getElementById('cards');
    if (!container) return;
    const filtered = filterByDecade(decade);

    container.innerHTML = filtered
      .map((mosque) => {

        const isSelected = selectedMosque === mosque.mosque_name;
        const thumb = driveThumbnail(mosque.image_url);
        const imgTag = thumb
          ? `<img class="card-image" src="${escapeHtml(thumb)}" alt="">`
          : '<div class="card-image placeholder">No image</div>';
        const desc = mosque.description
          ? escapeHtml(
              mosque.description.length > 200
                ? mosque.description.slice(0, 200) + '…'
                : mosque.description
            )
          : '';
        const quote = mosque.traveler_quote
          ? escapeHtml(
              mosque.traveler_quote.length > 220
                ? mosque.traveler_quote.slice(0, 220) + '…'
                : mosque.traveler_quote
            )
          : '';
        const author = mosque.quote_author
          ? escapeHtml(mosque.quote_author)
          : '';
        const name = escapeHtml(mosque.mosque_name);
        const selectedClass = isSelected ? ' selected' : '';

        let quoteBlock = '';
        if (quote) {
          quoteBlock = `<blockquote class="card-quote">"${quote}"</blockquote>`;
          if (author) {
            quoteBlock += `<cite class="card-author">— ${author}</cite>`;
          }
        }

        return `
          <article class="card${selectedClass}" data-mosque="${escapeHtml(mosque.mosque_name)}" tabindex="0" role="button">
            ${imgTag}
            <div class="card-body">
              <h3 class="card-title">${name}</h3>
              ${desc ? `<p class="card-description">${desc}</p>` : ''}
              ${quoteBlock}
            </div>
          </article>
        `;
      })
      .join('');

    container.querySelectorAll('.card').forEach((el) => {
      el.addEventListener('click', function () {
        const name = this.getAttribute('data-mosque');
        if (!name) return;
        selectedMosque = name;
        const decade = parseInt(document.getElementById('decade-slider').value, 10);
        updateMap(decade);
        document.querySelectorAll('.card').forEach((c) => c.classList.remove('selected'));
        const card = document.querySelector(`.card[data-mosque="${CSS.escape(name)}"]`);
        if (card) card.classList.add('selected');
        history.replaceState(null, '', `?mosque=${encodeURIComponent(name)}`);
      });
    });
  }

  function initMap() {
    map = L.map('map').setView(BELGRADE, 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  }

  function parseQuery() {
    const params = new URLSearchParams(window.location.search);
    const mosque = params.get('mosque');
    if (mosque) selectedMosque = mosque;
  }

  function init() {
    const slider = document.getElementById('decade-slider');
    const output = document.getElementById('decade-value');
    if (!slider || !output) return;

    function setDecade(value) {
      const n = parseInt(value, 10);
      output.textContent = n;
      updateMap(n);
      renderCards(n);
    }

    slider.addEventListener('input', function () {
      setDecade(this.value);
    });

    parseQuery();
    initMap();

    const initialDecade = parseInt(slider.value, 10);
    setDecade(initialDecade);
  }

  Promise.all([
    fetch('data/mosque_about.json').then((r) => r.json()),
    fetch('data/mosques_decades.json').then((r) => r.json())
  ])
    .then(([about, decades]) => {
      mosqueAbout = about;
      mosquesDecades = decades;
      const slider = document.getElementById('decade-slider');
      if (slider && mosqueAbout.length) {
        const built = mosqueAbout.map((m) => m.decade_built).filter((n) => n != null);
        const demolished = mosqueAbout.map((m) => m.decade_demolished).filter((n) => n != null && n !== '');
        const minDecade = Math.min(...built);
        const maxDecade = demolished.length ? Math.max(...demolished) : Math.max(...built);
        slider.min = minDecade;
        slider.max = maxDecade;
        if (slider.value < minDecade || slider.value > maxDecade) {
          slider.value = Math.round((minDecade + maxDecade) / 2 / 10) * 10;
        }
        document.getElementById('decade-value').textContent = slider.value;
      }
      init();
    })
    .catch((err) => {
      console.error('Failed to load data', err);
      document.body.insertAdjacentHTML(
        'beforeend',
        '<p style="padding:1rem;color:#ff6b6b;">Failed to load mosque data. Ensure data/mosque_about.json and data/mosques_decades.json exist.</p>'
      );
    });
})();
