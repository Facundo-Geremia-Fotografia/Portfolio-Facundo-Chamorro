// =========================
// ARCHIVO: script.js (refactor para contenido dinámico)
// =========================

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
});

let lightboxItems = [];
let lightboxIndex = -1;
let lightboxInitialized = false;

function observeFadeIns(root = document) {
  root.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
}

// Parallax suave para el hero (usa background-image definido desde JSON)
function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    hero.style.backgroundPositionY = -(scrolled * 0.2) + 'px';
  });
}

// Render helpers
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === 'class') e.className = v;
    else if (k.startsWith('data-')) e.setAttribute(k, v);
    else if (k === 'html') e.innerHTML = v;
    else e[k] = v;
  });
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (!c && c !== 0) return;
    e.append(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return e;
}

async function loadJSON(path){
  try{
    const res = await fetch(path);
    return await res.json();
  }catch(e){
    console.warn('No se pudo cargar', path, e);
    return null;
  }
}

async function renderSection(name){
  const container = document.querySelector(`[data-section="${name}"]`);
  if(!container) return;

  const data = await loadJSON(`sections/${name}.json`);
  if(!data) return;

  if(name === 'about'){
    const target = container.querySelector('[data-content]');
    if(!target) return;
    target.innerHTML = data.html || '';
    observeFadeIns(target);
    return;
  }

  if(!data) return;

  // Contact, Services (html content)
  if(data.html && name !== 'about'){
    const target = container.querySelector('[data-content]');
    if(!target) return;
    target.innerHTML = data.html;
    observeFadeIns(target);
    return;
  }

  // Portfolio
  if(name === 'portfolio'){
    // categories
    const catsEl = container.querySelector('[data-categories]');
    catsEl.innerHTML = '';
    const allBtn = el('button', {'class':'active','data-filter':'all'}, 'Todo');
    catsEl.appendChild(allBtn);
    const categories = data.categories || [];
    categories.forEach(cat => {
      catsEl.appendChild(el('button', {'data-filter':cat.slug}, cat.label));
    });

    // gallery
    const gallery = container.querySelector('[data-content]');
    gallery.innerHTML = '';
    const categoryMap = new Map((data.categories || []).map(cat => [cat.slug, cat.label]));
    (data.items||[]).forEach(item => {
      const categoryLabel = categoryMap.get(item.category) || item.category || '';
      const div = el('div', {
        class: `gallery-item ${item.category} fade-in`,
        'data-category': item.category || '',
        'data-category-label': categoryLabel
      });

      const imageSrc = item.src || '';
      const normalizedSrc = imageSrc.startsWith('http') ? imageSrc : imageSrc.replace(/^\/+/,'');

      if(item.src_before){
        const compare = el('div', {class: 'comparative'}, [
          el('div', {class: 'compare-card'}, [
            el('p', {class: 'compare-label'}, 'Antes'),
            el('img', {src: item.src_before || '', alt: item.alt ? `${item.alt} antes` : 'Antes'})
          ]),
          el('div', {class: 'compare-card'}, [
            el('p', {class: 'compare-label'}, 'Después'),
            el('img', {src: normalizedSrc, alt: item.alt ? `${item.alt} después` : 'Después'})
          ])
        ]);
        div.appendChild(compare);
      } else {
        const img = el('img', {src: normalizedSrc, alt: item.alt || ''});
        div.appendChild(img);
      }

      gallery.appendChild(div);
    });

    // init filters
    initFilters();
    observeFadeIns(container);
    return;
  }

}

async function renderEdiciones(){
  const container = document.getElementById('contenedor-ediciones');
  if(!container) return;

  const data = await loadJSON('sections/ediciones.json');
  if(!Array.isArray(data)) return;

  container.innerHTML = '';

  data.forEach(item => {
    const title = el('h3', {class:'edicion-title'}, item.titulo || 'Antes y Después');
    const beforeSrc = item.src_antes || item.antes || item.before || '';
    const afterSrc = item.src_despues || item.despues || item.after || '';
    const card = el('div', {class:'edicion-card'}, [
      el('div', {class:'edicion-image-card'}, [
        el('p', {class:'compare-label'}, 'Antes'),
        el('img', {src: beforeSrc, alt: item.titulo ? `${item.titulo} antes` : 'Antes'})
      ]),
      el('div', {class:'edicion-image-card'}, [
        el('p', {class:'compare-label'}, 'Después'),
        el('img', {src: afterSrc, alt: item.titulo ? `${item.titulo} después` : 'Después'})
      ])
    ]);

    const wrapper = el('div', {class:'edicion-pair fade-in'}, [title, card]);
    container.appendChild(wrapper);
  });

  observeFadeIns(container);
}

function renderEdicionesPage(){
  const container = document.getElementById('galeria-ediciones');
  if(!container) return;

  const trabajos = [
    {
      antes: 'antes-01.jpg',
      despues: 'despues-01.jpg',
      titulo: 'Edición 01 - Corrección tonal y enfoque',
      descripcion: 'Ajuste de color, contraste y composición para reforzar la presencia visual de la imagen.'
    },
    {
      antes: 'antes-02.jpg',
      despues: 'despues-02.jpg',
      titulo: 'Edición 02 - Realce de textura y detalle',
      descripcion: 'Retoques finos para resaltar superficies, luz y profundidad sin perder la naturalidad.'
    },
    {
      antes: 'antes-03.jpg',
      despues: 'despues-03.jpg',
      titulo: 'Edición 03 - Balance cromático y claridad',
      descripcion: 'Se trabaja la intensidad tonal y la claridad para lograr una imagen más limpia y impactante.'
    },
    {
      antes: 'antes-04.jpg',
      despues: 'despues-04.jpg',
      titulo: 'Edición 04 - Estilo editorial y contraste',
      descripcion: 'Se favorece el impacto visual con un contraste más controlado y un tratamiento más premium.'
    },
    {
      antes: 'antes-05.jpg',
      despues: 'despues-05.jpg',
      titulo: 'Edición 05 - Retoque final para presentación',
      descripcion: 'Detalle final de color, brillo y limpieza visual para una imagen lista para publicación o portfolio.'
    }
  ];

  container.innerHTML = trabajos.map(trabajo => {
    const antesPath = `images/Ediciones-fotograficas/Antes/edicion/${encodeURIComponent(trabajo.antes)}`;
    const despuesPath = `images/Ediciones-fotograficas/Despues/${encodeURIComponent(trabajo.despues)}`;

    return `
      <article class="photo-editing-card">
        <h3 class="titulo-edicion">${trabajo.titulo}</h3>
        <div class="comparison-wrapper" data-comparison-wrapper>
          <img class="comparison-image before" src="${antesPath}" alt="Antes de ${trabajo.titulo}">
          <img class="comparison-image after" src="${despuesPath}" alt="Después de ${trabajo.titulo}">
          <div class="comparison-overlay" data-comparison-overlay></div>
          <div class="comparison-slider" data-comparison-slider>
            <div class="slider-handle" data-slider-handle>
              <span class="slider-icon">⇄</span>
            </div>
          </div>
        </div>
        <p class="comparison-copy">${trabajo.descripcion}</p>
      </article>
    `;
  }).join('');

  observeFadeIns(container);
}

function initComparisonSlider(){
  const wrappers = document.querySelectorAll('[data-comparison-wrapper]');

  wrappers.forEach(wrapper => {
    const afterImage = wrapper.querySelector('.comparison-image.after');
    const overlay = wrapper.querySelector('[data-comparison-overlay]');
    const sliderHandle = wrapper.querySelector('[data-slider-handle]');
    const slider = wrapper.querySelector('[data-comparison-slider]');

    if(!afterImage || !overlay || !sliderHandle || !slider) return;

    let isDragging = false;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const update = clientX => {
      const rect = wrapper.getBoundingClientRect();
      const percent = clamp((clientX - rect.left) / rect.width, 0, 1);
      const width = `${percent * 100}%`;
      afterImage.style.width = width;
      overlay.style.left = width;
      slider.style.left = width;
    };

    const startDrag = event => {
      isDragging = true;
      event.preventDefault();
    };

    const stopDrag = () => {
      isDragging = false;
    };

    const drag = event => {
      if (!isDragging) return;
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      update(clientX);
    };

    sliderHandle.addEventListener('mousedown', startDrag);
    sliderHandle.addEventListener('touchstart', startDrag, {passive:false});
    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, {passive:false});
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);

    wrapper.addEventListener('click', event => {
      if (event.target === wrapper) update(event.clientX);
    });

    update(wrapper.getBoundingClientRect().left + wrapper.clientWidth / 2);
  });
}

function initFilters(){
  const buttons = document.querySelectorAll('.categories button');
  const items = document.querySelectorAll('.gallery-item');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      items.forEach(item => {
        if(filter === 'all' || item.classList.contains(filter)) item.style.display = 'block';
        else item.style.display = 'none';
      });
    });
  });
}

function closeLightbox(){
  const lightbox = document.getElementById('lightbox');
  if(!lightbox) return;
  lightbox.classList.add('hidden');
  document.body.style.overflow = '';
}

function showLightboxItem(index){
  if(!lightboxItems.length) return;
  lightboxIndex = ((index % lightboxItems.length) + lightboxItems.length) % lightboxItems.length;
  const item = lightboxItems[lightboxIndex];
  openLightbox(item.src, item.alt);
}

function showPreviousImage(){
  showLightboxItem(lightboxIndex - 1);
}

function showNextImage(){
  showLightboxItem(lightboxIndex + 1);
}

function initLightbox(){
  if(lightboxInitialized) return;
  const gallery = document.querySelector('.gallery');
  const lightbox = document.getElementById('lightbox');
  if(!gallery || !lightbox) return;

  const updateItems = () => {
    lightboxItems = Array.from(gallery.querySelectorAll('.gallery-item img')).map(img => {
      const item = img.closest('.gallery-item');
      return {
        src: img.src,
        alt: img.alt || 'Imagen del portfolio',
        category: item ? item.dataset.category || '' : '',
        categoryLabel: item ? item.dataset.categoryLabel || '' : ''
      };
    });
  };

  updateItems();

  const categoryButton = lightbox.querySelector('[data-lightbox-category]');

  gallery.addEventListener('click', event => {
    const image = event.target.closest('.gallery-item img');
    if(!image) return;
    event.preventDefault();
    lightboxIndex = Array.from(gallery.querySelectorAll('.gallery-item img')).findIndex(item => item.src === image.src);
    if(lightboxIndex === -1) lightboxIndex = 0;
    showLightboxItem(lightboxIndex);
  });

  const prev = lightbox.querySelector('[data-lightbox-prev]');
  const next = lightbox.querySelector('[data-lightbox-next]');
  const img = lightbox.querySelector('[data-lightbox-img]');

  prev.addEventListener('click', event => {
    event.stopPropagation();
    showPreviousImage();
  });

  next.addEventListener('click', event => {
    event.stopPropagation();
    showNextImage();
  });

  if(categoryButton){
    categoryButton.addEventListener('click', event => {
      event.stopPropagation();
      const current = lightboxItems[lightboxIndex];
      if(!current || !current.category) return;
      closeLightbox();
      const filterBtn = document.querySelector(`.categories button[data-filter="${current.category}"]`);
      if(filterBtn){
        filterBtn.click();
      }
      document.getElementById('portfolio').scrollIntoView({behavior:'smooth'});
    });
  }

  img.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', event => {
    if(event.target === lightbox || event.target.closest('[data-lightbox-close]')){
      closeLightbox();
    }
  });

  lightboxInitialized = true;
}

function openLightbox(src, alt){
  const lightbox = document.getElementById('lightbox');
  const img = lightbox.querySelector('[data-lightbox-img]');
  const caption = lightbox.querySelector('[data-lightbox-caption]');
  const categoryButton = lightbox.querySelector('[data-lightbox-category]');
  const current = lightboxItems[lightboxIndex] || {};
  img.src = src;
  img.alt = alt;
  caption.textContent = alt || '';
  if(categoryButton){
    if(current.category && current.categoryLabel){
      categoryButton.textContent = `Más fotos ${current.categoryLabel}`;
      categoryButton.classList.remove('hidden');
    } else {
      categoryButton.classList.add('hidden');
    }
  }
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

async function init(){
  // render all sections we have JSON for
  const sections = ['about','portfolio','contact'];
  await Promise.all(sections.map(s => renderSection(s)));
  await renderEdiciones();
  renderEdicionesPage();
  initComparisonSlider();
  initParallax();
  initLightbox();
  observeFadeIns();
}

init();

// ------------------
// Editor UI
// ------------------
const editorToggle = document.getElementById('editor-toggle');
const editorPanel = document.getElementById('editor-panel');
const editorClose = document.getElementById('editor-close');
const editorLoad = document.getElementById('editor-load');
const editorSave = document.getElementById('editor-save');
const editorCopy = document.getElementById('editor-copy');
const editorRefresh = document.getElementById('editor-refresh');

if(editorToggle && editorPanel) editorToggle.addEventListener('click', () => editorPanel.classList.toggle('hidden'));
if(editorClose && editorPanel) editorClose.addEventListener('click', () => editorPanel.classList.add('hidden'));

const editorTabs = document.querySelectorAll('.editor-tabs button');
editorTabs.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.editor-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.querySelectorAll('[data-editor]').forEach(sec => sec.classList.add('hidden'));
    document.querySelector(`[data-editor="${tab}"]`)?.classList.remove('hidden');
  });
});

async function loadEditorData(){
  const sections = ['hero','about','portfolio','contact'];
  const data = {};
  for(const s of sections){
    data[s] = await loadJSON(`sections/${s}.json`) || {};
  }

  // populate hero
  if(data.hero){
    document.getElementById('hero-title').value = data.hero.title || '';
    document.getElementById('hero-subtitle').value = data.hero.subtitle || '';
    document.getElementById('hero-background').value = data.hero.background || '';
    document.getElementById('hero-cta-label').value = (data.hero.cta && data.hero.cta.label) || '';
    document.getElementById('hero-cta-href').value = (data.hero.cta && data.hero.cta.href) || '';
  }

  if(data.about){
    document.getElementById('about-html').value = data.about.html || '';
  }

  if(data.portfolio){
    document.getElementById('portfolio-cats').value = JSON.stringify(data.portfolio.categories||[], null, 2);
    document.getElementById('portfolio-items').value = JSON.stringify(data.portfolio.items||[], null, 2);
  }

  if(data.services){
    document.getElementById('services-html').value = data.services.html || '';
  }

  if(data.contact){
    document.getElementById('contact-html').value = data.contact.html || '';
  }
}

if(editorLoad){
  editorLoad.addEventListener('click', async () => {
    editorLoad.disabled = true;
    await loadEditorData();
    editorLoad.disabled = false;
  });
}

function downloadJSON(filename, obj){
  const txt = JSON.stringify(obj, null, 2);
  const blob = new Blob([txt], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

if(editorSave){
  editorSave.addEventListener('click', () => {
    // determine active tab
    const activeButton = document.querySelector('.editor-tabs button.active');
    if(!activeButton) return;
    const active = activeButton.dataset.tab;
    if(active === 'hero'){
    const obj = {
      title: document.getElementById('hero-title').value,
      subtitle: document.getElementById('hero-subtitle').value,
      background: document.getElementById('hero-background').value,
      cta: { label: document.getElementById('hero-cta-label').value, href: document.getElementById('hero-cta-href').value }
    };
    downloadJSON('hero.json', obj);
  } else if(active === 'about'){
    const obj = { html: document.getElementById('about-html').value };
    downloadJSON('about.json', obj);
  } else if(active === 'portfolio'){
    let cats = [];
    let items = [];
    try{ cats = JSON.parse(document.getElementById('portfolio-cats').value); }catch(e){ alert('JSON inválido en categorías'); return; }
    try{ items = JSON.parse(document.getElementById('portfolio-items').value); }catch(e){ alert('JSON inválido en items'); return; }
      const obj = { categories: cats, items: items };
      downloadJSON('portfolio.json', obj);
    } else if(active === 'services'){
      const obj = { html: document.getElementById('services-html').value };
      downloadJSON('services.json', obj);
    } else if(active === 'contact'){
      const obj = { html: document.getElementById('contact-html').value };
      downloadJSON('contact.json', obj);
    }
  });
}

if(editorCopy){
  editorCopy.addEventListener('click', () => {
    const activeButton = document.querySelector('.editor-tabs button.active');
    if(!activeButton) return;
    const active = activeButton.dataset.tab;
    let txt = '';
  if(active === 'hero') txt = JSON.stringify({ title: document.getElementById('hero-title').value, subtitle: document.getElementById('hero-subtitle').value, background: document.getElementById('hero-background').value, cta:{label: document.getElementById('hero-cta-label').value, href: document.getElementById('hero-cta-href').value} }, null, 2);
  if(active === 'about') txt = document.getElementById('about-html').value;
  if(active === 'portfolio') txt = JSON.stringify({ categories: JSON.parse(document.getElementById('portfolio-cats').value||'[]'), items: JSON.parse(document.getElementById('portfolio-items').value||'[]') }, null, 2);
  if(active === 'services') txt = document.getElementById('services-html').value;
    if(active === 'contact') txt = document.getElementById('contact-html').value;
    navigator.clipboard.writeText(txt).then(()=> alert('Copiado al portapapeles'))
  });
}

if(editorRefresh){
  editorRefresh.addEventListener('click', async () => {
    await init();
    alert('Vista actualizada');
  });
}