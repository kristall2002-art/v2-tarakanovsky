(function(){
"use strict";
var html = document.documentElement;
function $(s, r){ return (r||document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function store(k, v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }

/* ---------- шапка: фон при скролле, поверх фото — белый текст ---------- */
function initHeader(){
  var hdr = $('#hdr'), hero = $('#home');
  function onScroll(){
    var y = window.scrollY || window.pageYOffset;
    hdr.classList.toggle('scrolled', y > 40);
    var heroH = hero ? hero.offsetHeight : 0;
    hdr.classList.toggle('on-photo', y < heroH - 90 && y <= 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
}

/* ---------- мобильное меню ---------- */
function initMenu(){
  var b = $('#burger'), m = $('#mmenu'), close = $('#mmenuClose');
  function open(){ m.classList.add('open'); b.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; }
  function shut(){ m.classList.remove('open'); b.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
  if(b) b.addEventListener('click', open);
  if(close) close.addEventListener('click', shut);
  $$('#mmenu a').forEach(function(a){ a.addEventListener('click', shut); });
}

/* ---------- аккордеон услуг ---------- */
function initServices(){
  $$('.svc-card').forEach(function(card){
    var head = $('.svc-head', card), drop = $('.svc-drop', card);
    head.addEventListener('click', function(){
      var open = card.getAttribute('aria-open') === 'true';
      $$('.svc-card').forEach(function(c){
        if(c!==card){ c.setAttribute('aria-open','false'); $('.svc-head',c).setAttribute('aria-expanded','false'); $('.svc-drop',c).style.maxHeight=null; }
      });
      card.setAttribute('aria-open', open ? 'false' : 'true');
      head.setAttribute('aria-expanded', open ? 'false' : 'true');
      drop.style.maxHeight = open ? null : (drop.scrollHeight + 40) + 'px';
    });
  });
  $$('.svc-book').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var cat = btn.getAttribute('data-cat');
      var sel = $('#fService');
      if(sel){ Array.prototype.forEach.call(sel.options, function(o){ if(o.value===cat) sel.value=cat; }); }
      var f = $('#contacts'); if(f) f.scrollIntoView({behavior:'smooth'});
      setTimeout(function(){ var n = $('#fName'); if(n) n.focus(); }, 500);
    });
  });
}

/* ---------- FAQ ---------- */
function initFaq(){
  $$('.faq-i').forEach(function(it){
    var btn = $('button', it), body = $('div', it);
    btn.addEventListener('click', function(){
      var open = it.getAttribute('data-open') === '1';
      it.setAttribute('data-open', open ? '0' : '1');
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      body.style.maxHeight = open ? null : (body.scrollHeight + 20) + 'px';
    });
  });
}

/* ---------- плашка «чем занимаемся» — прокрутка к разделам ---------- */
function initHeroPanel(){
  $$('.hp-item').forEach(function(it){
    it.addEventListener('click', function(){
      var id = it.getAttribute('data-goto');
      var el = id && document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth'});
    });
  });
}

/* ---------- размер текста + режим для слабовидящих ---------- */
var FS = [0.9, 1, 1.15, 1.3, 1.5];
function initA11y(){
  var i = parseInt(store('nb_fs'), 10); if(isNaN(i) || i<0 || i>=FS.length) i = 1;
  function apply(){
    html.style.setProperty('--fs', FS[i]); store('nb_fs', String(i));
    var d = $('#fsDown'), u = $('#fsUp');
    if(d) d.disabled = (i===0); if(u) u.disabled = (i===FS.length-1);
  }
  apply();
  var u = $('#fsUp'), d = $('#fsDown');
  if(u) u.addEventListener('click', function(){ if(i<FS.length-1){ i++; apply(); } });
  if(d) d.addEventListener('click', function(){ if(i>0){ i--; apply(); } });
  if(store('nb_hc') === '1') html.setAttribute('data-hc','1');
  var h = $('#hcBtn');
  if(h){
    h.classList.toggle('on', html.getAttribute('data-hc')==='1');
    h.setAttribute('aria-pressed', html.getAttribute('data-hc')==='1' ? 'true':'false');
    h.addEventListener('click', function(){
      var on = html.getAttribute('data-hc') !== '1';
      if(on) html.setAttribute('data-hc','1'); else html.removeAttribute('data-hc');
      h.classList.toggle('on', on);
      h.setAttribute('aria-pressed', on ? 'true':'false');
      store('nb_hc', on ? '1':'0');
    });
  }
}

/* ---------- форма записи (mailto) ---------- */
function initForm(){
  var f = $('#bookForm'); if(!f) return;
  f.addEventListener('submit', function(e){
    e.preventDefault();
    var ok = true;
    var name = $('#fName'), phone = $('#fPhone'), service = $('#fService');
    [ [name, name.value.trim().length>1], [phone, /\+?\d[\d\s()-]{6,}/.test(phone.value)], [service, !!service.value] ]
      .forEach(function(pair){ var el=pair[0].closest('.fld'); el.classList.toggle('err', !pair[1]); if(!pair[1]) ok=false; });
    if(!ok) return;
    var lines = [
      'Заявка на приём с сайта Нотариус Таракановский', '',
      'Нотариус: Таракановский Леонид Феликсович',
      'Имя: ' + name.value.trim(),
      'Телефон: ' + phone.value.trim(),
      'Услуга: ' + (service.value || '—'),
      'Удобное время: ' + ($('#fTime').value.trim() || '—'),
      'Комментарий: ' + ($('#fComment').value.trim() || '—'), '',
      'Сайт: ' + location.href
    ];
    var href = 'mailto:site_vseti@mail.ru?subject=' + encodeURIComponent('Запись к нотариусу — Нотариус Таракановский') +
      '&body=' + encodeURIComponent(lines.join('\n'));
    window.location.href = href;
    var okEl = $('#fOk'); okEl.textContent = 'Письмо сформировано и открыто в почтовом клиенте. Если оно не открылось — позвоните +7 (812) 315-25-23.';
    okEl.classList.add('show');
  });
  $$('input,select,textarea', f).forEach(function(el){ el.addEventListener('input', function(){ el.closest('.fld').classList.remove('err'); }); });
}

/* ---------- материалы конторы: тарифы / документы / разъяснения / полезное / ПДн ---------- */
var INFO_TABS = [['tariffs','Тарифы'],['docs','Какие документы нужны'],['articles','Разъяснения нотариуса'],['useful','Полезная информация'],['pdn','Обработка персональных данных']];
var infoTab = '', infoData = null, infoLoading = null;
function loadInfo(){
  if(infoData) return Promise.resolve();
  if(!infoLoading){
    infoLoading = fetch('content.json').then(function(r){ return r.json(); }).then(function(j){ infoData = j; }).catch(function(){ infoData = {}; });
  }
  return infoLoading;
}
function esch(v){ return String(v==null?'':v).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function infoHas(id){
  var c = infoData || {};
  if(id==='tariffs'){ var tf=c.tariffs||{}; return !!((tf.rows||[]).length || tf.intro || (tf.files||[]).length); }
  if(id==='docs') return !!(c.docs||[]).length;
  if(id==='articles') return !!(c.articles||[]).length;
  if(id==='useful') return !!((c.useful||[]).length || ((c.history||{}).paragraphs||[]).length);
  if(id==='pdn') return (((c.pdn||{}).paragraphs)||[]).length > 0;
  return false;
}
function pars(list){ return (list||[]).map(function(p){ return '<p>'+esch(p)+'</p>'; }).join(''); }
function files(list){
  return (list||[]).map(function(f){
    return '<a class="info-f" href="'+esch(f.url)+'" target="_blank" rel="noopener"><svg class="ico"><use href="#ico-scroll"/></svg>'+esch(f.title||'Скачать')+'</a>';
  }).join('');
}
function acc(title, inner){
  return '<div class="info-i"><button type="button" aria-expanded="false"><span>'+esch(title)+'</span><span class="pl"><svg class="ico"><use href="#ico-plus-s"/></svg></span></button><div>'+inner+'</div></div>';
}
function infoBody(id){
  var c = infoData || {}, out = '';
  if(id==='tariffs'){
    var tf = c.tariffs || {}, inner = pars(tf.intro ? [tf.intro] : []);
    if((tf.rows||[]).length){
      inner += '<table><tbody>' + tf.rows.map(function(r){
        return '<tr><td>'+esch(r.service)+'</td><td>'+esch(r.tariff)+'</td><td>'+esch(r.upth)+'</td><td>'+esch(r.total)+'</td></tr>';
      }).join('') + '</tbody></table>';
    }
    inner += files(tf.files) + pars(tf.note ? [tf.note] : []);
    out = acc(tf.title || 'Тарифы', inner);
  } else if(id==='docs'){
    out = (c.docs||[]).map(function(d){
      var inner = pars(d.intro ? [d.intro] : []);
      (d.sections||[]).forEach(function(sec){
        if(sec.title) inner += '<h4>'+esch(sec.title)+'</h4>';
        if(sec.text) inner += '<p>'+esch(sec.text)+'</p>';
        if((sec.items||[]).length) inner += '<ul>' + sec.items.map(function(i){ return '<li>'+esch(i)+'</li>'; }).join('') + '</ul>';
      });
      return acc(d.title, inner + files(d.files));
    }).join('');
  } else if(id==='articles'){
    out = (c.articles||[]).map(function(a){
      var head = a.title ? ((a.date ? a.date+' · ' : '') + a.title) : (a.date || 'Разъяснения');
      return acc(head, pars(a.paragraphs) + files(a.files));
    }).join('');
  } else if(id==='useful'){
    out = (c.useful||[]).map(function(u){
      var inner = pars(u.text ? [u.text] : []);
      (u.entries||[]).forEach(function(e){
        var bits = [];
        if(e.address) bits.push(esch(e.address));
        (e.phones||[]).forEach(function(ph){ bits.push('<a href="tel:'+esch(String(ph).replace(/[^+\d]/g,''))+'">'+esch(ph)+'</a>'); });
        if(e.email) bits.push('<a href="mailto:'+esch(e.email)+'">'+esch(e.email)+'</a>');
        if(e.url) bits.push('<a href="'+esch(e.url)+'" target="_blank" rel="noopener">'+esch(e.url)+'</a>');
        inner += '<p><b>'+esch(e.name)+'</b><br>'+bits.join('<br>')+'</p>';
      });
      return acc(u.title, inner);
    }).join('');
    var h = c.history || {};
    if((h.paragraphs||[]).length) out += acc(h.title || 'История дома', pars(h.paragraphs));
  } else if(id==='pdn'){
    var pd = c.pdn || {};
    out = acc(pd.title || 'Обработка персональных данных', pars(pd.paragraphs));
  }
  return out;
}
function renderInfo(){
  var tabsEl = $('#infoTabs'), bodyEl = $('#infoBody');
  if(!tabsEl || !bodyEl) return;
  var avail = INFO_TABS.filter(function(x){ return infoHas(x[0]); });
  if(!avail.length){ bodyEl.innerHTML = '<p>Материалы временно недоступны.</p>'; return; }
  if(!infoTab || avail.map(function(x){return x[0];}).indexOf(infoTab) < 0) infoTab = avail[0][0];
  tabsEl.innerHTML = avail.map(function(x){
    return '<button type="button" role="tab" data-itab="'+x[0]+'" aria-selected="'+(x[0]===infoTab)+'">'+esch(x[1])+'</button>';
  }).join('');
  bodyEl.innerHTML = infoBody(infoTab);
  var first = $('.info-i', bodyEl);
  if(first){ first.classList.add('open'); $('button', first).setAttribute('aria-expanded','true'); $('div',first).style.maxHeight = $('div',first).scrollHeight + 'px'; }
}
function openModal(id){
  var m = document.getElementById(id);
  if(!m) return;
  m.removeAttribute('hidden');
  requestAnimationFrame(function(){ m.classList.add('open'); });
  document.body.style.overflow = 'hidden';
}
function closeModal(m){
  m.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(function(){ m.setAttribute('hidden',''); }, 220);
}
function openInfo(tab){
  openModal('infoModal');
  loadInfo().then(function(){
    if(tab && infoHas(tab)) infoTab = tab;
    renderInfo();
  });
}
function initInfo(){
  var m = $('#infoModal'); if(!m) return;
  $$('[data-info]').forEach(function(b){ b.addEventListener('click', function(e){ e.preventDefault(); openInfo(b.getAttribute('data-info')); }); });
  var tabsEl = $('#infoTabs'), bodyEl = $('#infoBody');
  tabsEl.addEventListener('click', function(e){
    var b = e.target.closest('[data-itab]'); if(!b) return;
    infoTab = b.getAttribute('data-itab'); renderInfo();
    bodyEl.scrollTop = 0;
  });
  bodyEl.addEventListener('click', function(e){
    var b = e.target.closest('.info-i > button'); if(!b) return;
    var it = b.parentNode, open = it.classList.toggle('open');
    b.setAttribute('aria-expanded', open ? 'true':'false');
    var d = $('div', it);
    d.style.maxHeight = open ? (d.scrollHeight + 'px') : null;
  });
}
function initModals(){
  $$('.modal').forEach(function(m){
    m.addEventListener('click', function(e){ if(e.target === m) closeModal(m); });
    $$('[data-close]', m).forEach(function(b){ b.addEventListener('click', function(){ closeModal(m); }); });
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ $$('.modal.open').forEach(closeModal); }
  });
}

/* ---------- сдержанное появление блоков при прокрутке ---------- */
function initReveal(){
  var items = $$('[data-reveal]');
  if(!items.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !('IntersectionObserver' in window)){
    items.forEach(function(el){ el.classList.add('in-view'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, {rootMargin:'0px 0px -8% 0px', threshold:0.12});
  items.forEach(function(el){ io.observe(el); });
}

/* ---------- iOS Safari: включаем срабатывание :active по касанию ---------- */
function initTouchActive(){
  document.addEventListener('touchstart', function(){}, {passive:true});
}

function init(){
  initHeader(); initMenu(); initServices(); initFaq(); initHeroPanel();
  initA11y(); initForm(); initModals(); initInfo();
  initTouchActive(); initReveal();
  var y = $('#year'); if(y) y.textContent = new Date().getFullYear();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
