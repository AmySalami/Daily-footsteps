/* =========================================================
   DailyFootsteps — prototype app (vanilla JS)
   - All data in localStorage (key: df_state)
   - AI is MOCKED (heuristic). Swap mockReview() for the real
     proxy call in production.
   - Flow: user writes freely + names a Title (the topic).
     Language is chosen via a tag, or auto-detected on submit.
   ========================================================= */
(() => {
  'use strict';

  // ---------- constants ----------
  const LANGS = {
    en: { name: 'English', flag: '🇬🇧', speechLang: 'en-US' },
    de: { name: 'German',  flag: '🇩🇪', speechLang: 'de-DE' },
  };
  const SEED_WORKSPACE = {
    en: [
      { emoji: '🫖', label: "My grandmother's teapot", note: 'porcelain, chipped handle' },
      { emoji: '🚲', label: 'The old bicycle', note: 'rusty, still rides' },
      { emoji: '☕', label: 'My favorite coffee mug', note: 'morning ritual' },
      { emoji: '🌧️', label: 'A rainy Sunday', note: '' },
    ],
    de: [
      { emoji: '☕', label: 'Meine Kaffeetasse', note: 'jeden Morgen' },
      { emoji: '🚲', label: 'Mein altes Fahrrad', note: '' },
      { emoji: '🌳', label: 'Der Park am Morgen', note: 'ruhig und grün' },
      { emoji: '🌧️', label: 'Ein regnerischer Sonntag', note: '' },
    ],
  };
  const MINI_DICT = {
    en: {
      teapot:{t:'noun',m:'a container for making and pouring tea'},
      bicycle:{t:'noun',m:'a two-wheeled vehicle you pedal'},
      morning:{t:'noun',m:'the early part of the day'},
      rusty:{t:'adj',m:'covered with rust; out of practice'},
      quiet:{t:'adj',m:'making little or no noise'},
      remember:{t:'verb',m:'to keep in mind; recall'},
      gentle:{t:'adj',m:'mild, kind, or soft in action'},
    },
    de: {
      kaffeetasse:{t:'noun',m:'a coffee cup'},
      fahrrad:{t:'noun',m:'a bicycle'},
      morgen:{t:'noun',m:'the morning'},
      ruhig:{t:'adj',m:'calm, quiet'},
      regnerisch:{t:'adj',m:'rainy'},
      erinnern:{t:'verb',m:'to remember'},
    },
  };
  const STOPWORDS = new Set(('the a an and or but of to in on at for with my your his her its our their is are was were be been being this that these those it he she they we you i as by from about into over under then than so if not no yes ich du er sie es wir ihr der die das ein eine und oder aber mit von zu in an auf für ist sind war den dem des nicht ja nein').split(' '));
  const EMOJIS = ['🫖','🚲','☕','🌧️','🌳','📚','🎒','🐈','🎸','🏔️','🍞','🕰️','🧣','🪴','✏️','🗝️'];

  // language-detection word lists
  const DE_WORDS = new Set('der die das und ich nicht ein eine ist mit auf für sich dem den zu von wir sie es war haben sind wird auch aber oder weil wenn schreiben sprechen mein meine ganz sehr heute gestern morgen'.split(' '));
  const EN_WORDS = new Set('the and is a an to of in it was with for this that have are you my we they on at but or because when today yesterday very really about would could there their'.split(' '));

  // cat-paw SVG (shared by brand, trail, celebrate)
  const PAW_SVG = '<svg viewBox="0 0 64 64"><ellipse cx="23" cy="20" rx="7.5" ry="10.5" transform="rotate(-14 23 20)"/><ellipse cx="42" cy="18" rx="7.5" ry="11" transform="rotate(12 42 18)"/><ellipse cx="9.5" cy="35" rx="6.3" ry="9" transform="rotate(-26 9.5 35)"/><ellipse cx="55" cy="33" rx="6.3" ry="9" transform="rotate(24 55 33)"/><path d="M32 34c-10 0-17 7-17 14 0 6 4.5 9 9.5 9 3 0 4.5-1.3 7.5-1.3s4.5 1.3 7.5 1.3c5 0 9.5-3 9.5-9 0-7-7-14-17-14z"/></svg>';

  // ---------- state ----------
  const KEY = 'df_state';
  const todayStr = () => new Date().toISOString().slice(0,10);
  const uid = () => Math.random().toString(36).slice(2,9);
  const dayLabel = (n) => n + ' day' + (n===1?'':'s');

  function defaultState(){
    const mk = () => ({ streak:0, lastDate:null, days:[] });
    return {
      version:2,
      langs:{ en:mk(), de:mk() },
      workspace:{
        en: SEED_WORKSPACE.en.map(i=>({id:uid(),...i})),
        de: SEED_WORKSPACE.de.map(i=>({id:uid(),...i})),
      },
      exercises:[],
      vocab:{ en:[], de:[] },
    };
  }
  let state = load();
  function load(){
    try{ const s = JSON.parse(localStorage.getItem(KEY)); if(s && s.version) return s; }catch(e){}
    return defaultState();
  }
  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

  // ---------- streak logic ----------
  const daysBetween = (a,b) => Math.round((new Date(b)-new Date(a))/86400000);
  function completeToday(lang){
    const L = state.langs[lang];
    const today = todayStr();
    if(L.days.includes(today)) return;
    if(L.lastDate && daysBetween(L.lastDate,today)===1) L.streak += 1;
    else L.streak = 1;
    L.lastDate = today; L.days.push(today); save();
  }
  const doneToday = (lang) => state.langs[lang].days.includes(todayStr());

  // ---------- language detection ----------
  function detectLang(text){
    const t = text.toLowerCase();
    let de = 0, en = 0;
    if(/[äöüß]/.test(t)) de += 3;
    t.split(/[^a-zäöüß]+/).forEach(w=>{ if(DE_WORDS.has(w)) de++; if(EN_WORDS.has(w)) en++; });
    return de > en ? 'de' : 'en';
  }

  // ---------- mock AI (replace with proxy in production) ----------
  function mockReview(text, lang){
    const clean = text.trim().replace(/\s+/g,' ');
    const words = clean ? clean.split(' ') : [];
    const sentences = clean.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
    const wc = words.length;

    let score = Math.round(Math.min(98, 42 + wc*1.4 + sentences.length*3));
    if(wc < 8) score = Math.max(20, Math.round(wc*3));

    const polished = sentences.map(s => s.charAt(0).toUpperCase()+s.slice(1)).join('. ') + (sentences.length?'.':'');
    const changed = polished.trim() !== clean.trim();

    const sugg = [];
    if(wc < 30) sugg.push(lang==='de'?'Guter Anfang — versuche 40+ Wörter für mehr Flüssigkeit.':'Great start — try stretching to 40+ words to build fluency.');
    if(sentences.length <= 1) sugg.push(lang==='de'?'Teile den Gedanken in zwei, drei Sätze auf.':'Break the idea into two or three sentences for rhythm.');
    sugg.push(lang==='de'?'Verwende Verbindungswörter wie „weil", „obwohl", „deshalb".':'Use connectors like "however", "although", "because" to link ideas.');
    sugg.push(lang==='de'?'Achte auf die Groß- und Kleinschreibung der Nomen.':'Vary sentence length — mix short and long for a natural rhythm.');

    const dict = MINI_DICT[lang] || {};
    const seen = new Set(); const vocab = [];
    for(const raw of words){
      const w = raw.toLowerCase().replace(/[^a-zäöüß]/gi,'');
      if(w.length < 4 || STOPWORDS.has(w) || seen.has(w)) continue;
      seen.add(w);
      const hit = dict[w];
      const type = hit ? hit.t : guessType(w);
      vocab.push({
        word: raw.replace(/[.!?,;:]$/,''),
        type,
        meaning: hit ? hit.m : '— (defined by AI in production)',
        usage: usageHint(type),
        example: sentences.find(s=>s.toLowerCase().includes(w)) || `… ${raw} …`,
      });
      if(vocab.length >= 6) break;
    }
    return { score, polished, changed, original: clean, suggestions: sugg, vocab };
  }
  function guessType(w){
    if(/ly$/.test(w)) return 'adv';
    if(/(tion|ness|ment|ity|schaft|ung|heit|keit)$/.test(w)) return 'noun';
    if(/(ful|ous|ive|able|isch|ig|lich)$/.test(w)) return 'adj';
    if(/(ing|ed|ieren|en)$/.test(w)) return 'verb';
    return 'noun';
  }
  const usageHint = (t) => ({noun:'names a thing',verb:'an action',adj:'describes a noun',adv:'describes an action'})[t] || 'general';

  // ---------- footstep trail ----------
  function trailHTML(streak, opts){
    opts = opts || {};
    const minSlots = opts.minSlots || 7;
    const total = Math.max(minSlots, streak + (opts.compact?0:1));
    let out = `<div class="trail ${opts.compact?'compact':''}" aria-label="${dayLabel(streak)} streak">`;
    for(let i=0;i<total;i++){
      const filled = i < streak;
      const isToday = i === streak-1;
      out += `<span class="step ${filled?'filled':'empty'} ${isToday?'today':''}">${PAW_SVG}</span>`;
    }
    return out + '</div>';
  }

  // ---------- toast ----------
  let toastT;
  function toast(msg){
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(()=>el.classList.remove('show'), 2200);
  }

  // ---------- router ----------
  const app = document.getElementById('app');
  const routes = {};
  const route = (path, fn) => { routes[path] = fn; };
  function parseHash(){
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, ...rest] = h.split('?');
    return { path, params: Object.fromEntries(new URLSearchParams(rest.join('?'))) };
  }
  function navigate(){
    const { path, params } = parseHash();
    const fn = routes[path] || routes['/'+path.split('/')[1]] || routes['/'];
    setActiveNav(path);
    app.innerHTML = '';
    fn(params, path);
    window.scrollTo(0,0);
  }
  function setActiveNav(path){
    document.querySelectorAll('#topnav .nav-btn').forEach(a=>{
      const target = a.getAttribute('href').replace('#','');
      a.classList.toggle('nav-active', target === path || (target!=='/' && path.startsWith(target)));
    });
  }

  // ---------- DOM helpers ----------
  const h = (html) => { const t=document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const pickRandom = (arr) => arr[Math.floor(Math.random()*arr.length)];

  // =========================================================
  // VIEW: Practice (home = writing page)
  // =========================================================
  function renderPractice(params){
    let activeLang = (params.lang && LANGS[params.lang]) ? params.lang : null;
    const wrap = h('<div></div>');
    app.appendChild(wrap);

    wrap.appendChild(h(`
      <div class="practice-head">
        <p class="eyebrow">Daily practice</p>
        <h2>Write today's step.</h2>
      </div>`));

    // language chips (compact streak + selector tag)
    const strip = h('<div class="lang-strip"></div>');
    Object.entries(LANGS).forEach(([code,L])=>{
      const st = state.langs[code];
      const chip = h(`
        <button class="lang-chip ${code===activeLang?'is-selected':''}" data-lang="${code}">
          <span class="chip-top">
            <span class="chip-flag">${L.flag}</span>
            <span class="chip-name">${L.name}</span>
            ${doneToday(code)?'<span class="chip-check">done ✓</span>':''}
          </span>
          <span class="chip-bottom">
            ${trailHTML(st.streak,{compact:true,minSlots:5})}
            <span class="chip-num">${dayLabel(st.streak)}</span>
          </span>
        </button>`);
      chip.onclick = ()=>{
        activeLang = code;
        strip.querySelectorAll('.lang-chip').forEach(c=>c.classList.toggle('is-selected', c.dataset.lang===code));
        updateHint();
      };
      strip.appendChild(chip);
    });
    wrap.appendChild(strip);

    const hint = h('<p class="lang-hint"></p>');
    wrap.appendChild(hint);
    function updateHint(){
      hint.innerHTML = activeLang
        ? `Writing in <b>${LANGS[activeLang].name}</b>. Tap the other tag to switch.`
        : `Pick a language above, or just start writing — we'll detect it when you finish.`;
    }
    updateHint();

    // title + shuffle
    const titleRow = h(`
      <div class="title-row">
        <input class="input title-input" id="title" placeholder="What do you want to write about?" />
        <button class="shuffle-btn" id="shuffle" title="Pick a topic for me">🎲 Shuffle</button>
      </div>`);
    wrap.appendChild(titleRow);
    const titleInput = titleRow.querySelector('#title');
    titleRow.querySelector('#shuffle').onclick = ()=>{
      const pool = state.workspace[activeLang || 'en'];
      if(!pool || !pool.length){ toast('Add items in Workspace first'); return; }
      const item = pickRandom(pool);
      titleInput.value = item.label;
      toast('Topic picked 🎲');
      compose.focus();
    };

    // editor
    const editor = h(`
      <div>
        <div class="editor-toolbar">
          <button class="mic-btn" id="mic"><span class="mdot"></span> 🎤 Speak</button>
          <span class="wordcount" id="wc">0 words</span>
        </div>
        <textarea class="textarea compose" id="compose" placeholder="Start writing … or tap “Speak”. Describe your topic, or tell a little story about it."></textarea>
        <div class="row" style="margin-top:var(--space-block)">
          <button class="cta secondary" id="submit">Finish &amp; get feedback →</button>
          <span class="muted" style="font-size:var(--text-caption)">Your coach reviews, scores, and builds your vocabulary.</span>
        </div>
      </div>`);
    wrap.appendChild(editor);

    const compose = editor.querySelector('#compose');
    const wc = editor.querySelector('#wc');
    const updateWC = ()=>{ const n = compose.value.trim()?compose.value.trim().split(/\s+/).length:0; wc.textContent = n+' word'+(n===1?'':'s'); };
    compose.addEventListener('input', updateWC);

    // speech
    let recognition = null, recording = false;
    const micBtn = editor.querySelector('#mic');
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ micBtn.disabled=true; micBtn.title='Voice not supported in this browser'; micBtn.style.opacity=.5; }
    micBtn.onclick = ()=>{
      if(!SR) return;
      if(recording){ recognition && recognition.stop(); return; }
      recognition = new SR();
      recognition.lang = LANGS[activeLang || 'en'].speechLang;
      recognition.interimResults = true; recognition.continuous = true;
      let base = compose.value ? compose.value+' ' : '';
      recognition.onstart = ()=>{ recording=true; micBtn.classList.add('recording'); micBtn.innerHTML='<span class="mdot"></span> ■ Stop'; };
      recognition.onerror = ()=>toast('Mic error — allow microphone access');
      recognition.onend = ()=>{ recording=false; micBtn.classList.remove('recording'); micBtn.innerHTML='<span class="mdot"></span> 🎤 Speak'; };
      recognition.onresult = (e)=>{
        let interim='', fin='';
        for(let i=e.resultIndex;i<e.results.length;i++){ const r=e.results[i]; if(r.isFinal) fin+=r[0].transcript; else interim+=r[0].transcript; }
        if(fin) base += fin+' ';
        compose.value = (base+interim).replace(/\s+/g,' '); updateWC();
      };
      recognition.start();
    };

    editor.querySelector('#submit').onclick = ()=>{
      const text = compose.value.trim();
      if(text.split(/\s+/).filter(Boolean).length < 3){ toast('Write a little more first (3+ words)'); compose.focus(); return; }
      if(recording && recognition) recognition.stop();
      const auto = !activeLang;
      const lang = activeLang || detectLang(text);
      showResult(wrap, { text, title: titleInput.value.trim(), lang, auto });
    };
    updateWC();
  }

  function showResult(wrap, ctx){
    const { text, title, lang, auto } = ctx;
    const r = mockReview(text, lang);

    // persist
    state.exercises.push({ id:uid(), lang, date:todayStr(), title, input:text, score:r.score, review:r });
    const have = new Set(state.vocab[lang].map(v=>v.word.toLowerCase()));
    r.vocab.forEach(v=>{ if(!have.has(v.word.toLowerCase())){ state.vocab[lang].push({...v, date:todayStr()}); have.add(v.word.toLowerCase()); }});
    const wasDone = doneToday(lang);
    completeToday(lang);
    save();

    const st = state.langs[lang];
    wrap.innerHTML='';
    wrap.appendChild(h(`
      <div class="view-head row spread">
        <div>
          <p class="eyebrow">${LANGS[lang].flag} ${LANGS[lang].name} · review ${auto?'· auto-detected':''}</p>
          <h1 style="margin:.1em 0">${title?esc(title):'Nice work.'}</h1>
        </div>
        <a class="pill-btn" href="#/" data-link>← Practice</a>
      </div>`));

    wrap.appendChild(h(`
      <div class="ai-panel"><div class="inner">
        <div class="ai-tag"><span class="spark">✦</span> AI coach · mock feedback</div>
        <div class="score-ring">
          <div class="ring" style="--v:${r.score}"><div class="hole"><div class="num">${r.score}<small>/100</small></div></div></div>
          <div class="score-note">
            <h3>${r.score>=80?'Strong and clear.':r.score>=60?'Solid — a few tweaks.':'Good effort — keep building.'}</h3>
            <p class="muted">Scored on effort, sentence variety, and clarity. In production this comes from your AI coach.</p>
          </div>
        </div>
        <p class="eyebrow" style="margin:0 0 10px">Suggestions</p>
        <ul class="sugg">${r.suggestions.map(s=>`<li><span class="star">✦</span><span>${esc(s)}</span></li>`).join('')}</ul>
        <p class="eyebrow" style="margin:22px 0 10px">${r.changed?'Polished version':'Your writing'}</p>
        <div class="polished">${esc(r.polished||r.original)}</div>
      </div></div>`));

    const vsec = h(`<div class="stack"><div><p class="eyebrow">Vocabulary from today</p><h2 style="margin:.2em 0">${r.vocab.length} word${r.vocab.length===1?'':'s'} saved</h2></div></div>`);
    if(r.vocab.length){
      vsec.appendChild(h(`
        <table class="vocab-table">
          <thead><tr><th>Word</th><th>Type</th><th>Meaning</th><th>How to use</th><th>Example</th></tr></thead>
          <tbody>${r.vocab.map(v=>`
            <tr>
              <td class="word">${esc(v.word)}</td>
              <td><span class="type-tag">${v.type}</span></td>
              <td>${esc(v.meaning)}</td>
              <td class="muted">${esc(v.usage)}</td>
              <td class="ex">${esc(v.example)}</td>
            </tr>`).join('')}</tbody>
        </table>`));
    }
    wrap.appendChild(vsec);

    wrap.appendChild(h(`
      <div class="celebrate">
        <div class="big-paw">${PAW_SVG}</div>
        <h2 style="margin:.2em 0">${wasDone?'Another step today':st.streak+'-day streak!'}</h2>
        <p class="muted">${wasDone?'You already stepped today — this still counts as practice.':'Your footsteps trail just grew.'}</p>
        ${trailHTML(st.streak)}
        <div class="row" style="justify-content:center;margin-top:var(--space-block)">
          <a class="cta" href="#/" data-link>New exercise</a>
          <a class="pill-btn" href="#/vocab?lang=${lang}" data-link>See all vocabulary</a>
        </div>
      </div>`));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  route('/', renderPractice);
  route('/exercise', renderPractice); // alias

  // =========================================================
  // VIEW: Workspace
  // =========================================================
  route('/workspace', (params) => {
    let lang = params.lang || 'en';
    const wrap = h('<div></div>');
    wrap.appendChild(h(`
      <div class="view-head">
        <p class="eyebrow">Your workspace</p>
        <h1>My stuff</h1>
        <p class="muted">The things your exercises draw from. Type your own topic when you write, or hit 🎲 Shuffle to pull one of these.</p>
      </div>`));

    const sw = h('<div class="row" style="margin-bottom:var(--space-block)"></div>');
    Object.entries(LANGS).forEach(([code,L])=>{
      const b = h(`<button class="pill-btn ${code===lang?'is-active':''}">${L.flag} ${L.name}</button>`);
      b.onclick = ()=>{ lang=code; render(); };
      sw.appendChild(b);
    });
    wrap.appendChild(sw);
    const grid = h('<div class="ws-grid"></div>');
    wrap.appendChild(grid);
    app.appendChild(wrap);

    let picked = '📚';
    function render(){
      sw.querySelectorAll('.pill-btn').forEach((b,i)=>b.classList.toggle('is-active', Object.keys(LANGS)[i]===lang));
      grid.innerHTML = '';
      state.workspace[lang].forEach(item=>{
        const el = h(`
          <div class="ws-item">
            <span class="emo">${item.emoji||'📌'}</span>
            <div>
              <div class="lbl">${esc(item.label)}</div>
              ${item.note?`<div class="nt">${esc(item.note)}</div>`:''}
            </div>
            <button class="icon-btn rm" title="Remove">✕</button>
          </div>`);
        el.querySelector('.rm').onclick = ()=>{ state.workspace[lang]=state.workspace[lang].filter(x=>x.id!==item.id); save(); render(); toast('Removed'); };
        grid.appendChild(el);
      });
      const add = h(`
        <div class="ws-add">
          <div class="field"><label>New item</label><input class="input" placeholder="e.g. The train station near home" /></div>
          <div class="field"><label>Note (optional)</label><input class="input note" placeholder="a detail or two" /></div>
          <div class="emoji-pick"></div>
          <button class="cta block">＋ Add to workspace</button>
        </div>`);
      const ep = add.querySelector('.emoji-pick');
      EMOJIS.forEach(e=>{ const b=h(`<button class="${e===picked?'sel':''}">${e}</button>`); b.onclick=()=>{ picked=e; ep.querySelectorAll('button').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); }; ep.appendChild(b); });
      const input = add.querySelector('.input'), noteI = add.querySelector('.note');
      add.querySelector('.cta').onclick = ()=>{
        const label = input.value.trim();
        if(!label){ toast('Type something first'); input.focus(); return; }
        state.workspace[lang].push({id:uid(), emoji:picked, label, note:noteI.value.trim()});
        save(); render(); toast('Added ✓');
      };
      grid.appendChild(add);
    }
    render();
  });

  // =========================================================
  // VIEW: Vocabulary
  // =========================================================
  route('/vocab', (params) => {
    let lang = params.lang || 'en';
    const wrap = h('<div></div>');
    wrap.appendChild(h(`
      <div class="view-head">
        <p class="eyebrow">Your collection</p>
        <h1>Vocabulary</h1>
        <p class="muted">Every exercise adds new words here — with meaning, type, and an example from your own writing.</p>
      </div>`));
    const sw = h('<div class="row" style="margin-bottom:var(--space-block)"></div>');
    Object.entries(LANGS).forEach(([code,L])=>{
      const b=h(`<button class="pill-btn ${code===lang?'is-active':''}">${L.flag} ${L.name} <span class="muted">(${state.vocab[code].length})</span></button>`);
      b.onclick=()=>{ lang=code; render(); };
      sw.appendChild(b);
    });
    wrap.appendChild(sw);
    const body = h('<div></div>');
    wrap.appendChild(body);
    app.appendChild(wrap);

    function render(){
      sw.querySelectorAll('.pill-btn').forEach((b,i)=>b.classList.toggle('is-active', Object.keys(LANGS)[i]===lang));
      const list = state.vocab[lang];
      body.innerHTML='';
      if(!list.length){
        body.appendChild(h(`<div class="vocab-empty">No words yet. Finish an exercise to start your collection.<br/><br/><a class="cta" href="#/?lang=${lang}" data-link>Start writing</a></div>`));
        return;
      }
      body.appendChild(h(`
        <table class="vocab-table">
          <thead><tr><th>Word</th><th>Type</th><th>Meaning</th><th>How to use</th><th>Example</th></tr></thead>
          <tbody>${list.slice().reverse().map(v=>`
            <tr>
              <td class="word">${esc(v.word)}</td>
              <td><span class="type-tag">${v.type}</span></td>
              <td>${esc(v.meaning)}</td>
              <td class="muted">${esc(v.usage)}</td>
              <td class="ex">${esc(v.example)}</td>
            </tr>`).join('')}</tbody>
        </table>`));
    }
    render();
  });

  // ---------- boot ----------
  window.addEventListener('hashchange', navigate);
  document.addEventListener('DOMContentLoaded', navigate);
  if(document.readyState !== 'loading') navigate();
})();
