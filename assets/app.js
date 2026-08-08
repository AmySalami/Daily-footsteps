/* =========================================================
   DailyFootsteps — prototype app (vanilla JS)
   - All data in localStorage (key: df_state)
   - AI is MOCKED (heuristic) so the full flow is clickable.
     Swap mockReview() for the real proxy call in production.
   ========================================================= */
(() => {
  'use strict';

  // ---------- constants ----------
  const LANGS = {
    en: { name: 'English', flag: '🇬🇧', sub: 'Practice writing & speaking' },
    de: { name: 'German',  flag: '🇩🇪', sub: 'Deutsch üben — schreiben & sprechen' },
  };
  const PROMPTS = {
    en: {
      describe: (item) => `Describe <b>${item}</b> in as much detail as you can.`,
      story:    (item) => `Write a short story that involves <b>${item}</b>.`,
      speechLang: 'en-US',
    },
    de: {
      describe: (item) => `Beschreibe <b>${item}</b> so genau wie möglich.`,
      story:    (item) => `Schreibe eine kurze Geschichte mit <b>${item}</b>.`,
      speechLang: 'de-DE',
    },
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
  // tiny demo dictionary — production replaces this with real AI
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

  // ---------- state ----------
  const KEY = 'df_state';
  const todayStr = () => { const d = new Date(); return d.toISOString().slice(0,10); };
  const uid = () => Math.random().toString(36).slice(2,9);

  function defaultState(){
    const mk = () => ({ streak:0, lastDate:null, days:[] });
    return {
      version:1,
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
  function daysBetween(a,b){ return Math.round((new Date(b)-new Date(a))/86400000); }
  function completeToday(lang){
    const L = state.langs[lang];
    const today = todayStr();
    if(L.days.includes(today)) return; // already done
    if(L.lastDate && daysBetween(L.lastDate,today)===1) L.streak += 1;
    else L.streak = 1;
    L.lastDate = today;
    L.days.push(today);
    save();
  }
  function doneToday(lang){ return state.langs[lang].days.includes(todayStr()); }

  // ---------- mock AI (replace with proxy in production) ----------
  function mockReview(text, lang){
    const clean = text.trim().replace(/\s+/g,' ');
    const words = clean ? clean.split(' ') : [];
    const sentences = clean.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
    const wc = words.length;

    // score: rewards effort + sentence variety, capped
    let score = Math.round(Math.min(98, 42 + wc*1.4 + sentences.length*3));
    if(wc < 8) score = Math.max(20, Math.round(wc*3));

    // "polished" version: capitalize sentence starts, ensure end punctuation
    const polished = sentences.map(s => {
      let t = s.charAt(0).toUpperCase()+s.slice(1);
      return t;
    }).join('. ') + (sentences.length? '.' : '');
    const changed = polished.trim() !== clean.trim();

    // suggestions
    const sugg = [];
    if(wc < 30) sugg.push('Great start — try stretching to 40+ words to build fluency.');
    if(sentences.length <= 1) sugg.push('Break the idea into two or three sentences for rhythm.');
    sugg.push(lang==='de'
      ? 'Verwende Verbindungswörter wie „weil", „obwohl", „deshalb" für mehr Fluss.'
      : 'Use connectors like "however", "although", "because" to link ideas.');
    sugg.push(lang==='de'
      ? 'Achte auf die Groß- und Kleinschreibung der Nomen.'
      : 'Vary sentence length — mix short and long for a natural rhythm.');

    // vocabulary: distinct interesting words from the text
    const dict = MINI_DICT[lang] || {};
    const seen = new Set(); const vocab = [];
    for(const raw of words){
      const w = raw.toLowerCase().replace(/[^a-zäöüßa-z]/gi,'');
      if(w.length < 4 || STOPWORDS.has(w) || seen.has(w)) continue;
      seen.add(w);
      const hit = dict[w];
      const type = hit ? hit.t : guessType(w);
      const meaning = hit ? hit.m : '— (defined by AI in production)';
      const example = sentences.find(s=>s.toLowerCase().includes(w)) || `… ${raw} …`;
      vocab.push({ word: raw.replace(/[.!?,;:]$/,''), type, meaning, usage: usageHint(type), example });
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
  function usageHint(t){
    return ({noun:'names a thing',verb:'an action',adj:'describes a noun',adv:'describes an action'})[t] || 'general';
  }

  // ---------- footsteps ----------
  const FOOT_SVG = '<svg viewBox="0 0 40 60"><ellipse cx="20" cy="40" rx="12" ry="17"/><ellipse cx="20" cy="15" rx="9" ry="7"/></svg>';
  function trailHTML(streak, minSlots=7){
    const total = Math.max(minSlots, streak+1);
    let out = '<div class="trail" aria-label="'+streak+' day streak">';
    for(let i=0;i<total;i++){
      const filled = i < streak;
      const isToday = i === streak-1;
      out += `<span class="step ${filled?'filled':'empty'} ${isToday?'today':''}">${FOOT_SVG}</span>`;
    }
    out += '</div>';
    return out;
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
  function route(path, fn){ routes[path] = fn; }
  function parseHash(){
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, ...rest] = h.split('?');
    const params = Object.fromEntries(new URLSearchParams(rest.join('?')));
    return { path, params };
  }
  function navigate(){
    const { path, params } = parseHash();
    // match static or first segment
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
  function go(hash){ location.hash = hash; }

  // ---------- helpers to build DOM ----------
  const h = (html) => { const t=document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  // =========================================================
  // VIEW: Hub
  // =========================================================
  route('/', () => {
    const wrap = h('<div></div>');
    wrap.appendChild(h(`
      <section class="hub-hero">
        <p class="eyebrow">Daily language practice</p>
        <h1>One small exercise a day. Watch your footsteps add up.</h1>
        <p class="muted">Pick something from your world, describe it or tell its story, and let your coach review it. Choose a language to begin today's step.</p>
      </section>`));

    const grid = h('<div class="lang-grid"></div>');
    Object.entries(LANGS).forEach(([code, L])=>{
      const st = state.langs[code];
      const done = doneToday(code);
      const card = h(`
        <a class="lang-card" href="#/exercise?lang=${code}" data-link>
          <div class="flag">${L.flag}</div>
          <h2>${L.name}</h2>
          <div class="sub">${esc(L.sub)}</div>
          <div class="status-row">
            <span class="dot-status ${done?'done':'todo'}"></span>
            <span class="muted">${done?'Done today ✓':'Today’s step is waiting'}</span>
            <span style="margin-left:auto" class="streak-num">🔥 ${st.streak} day${st.streak===1?'':'s'}</span>
          </div>
          ${trailHTML(st.streak)}
          <div class="trail-caption">${st.streak? 'Keep the trail going.' : 'Take your first step.'}</div>
        </a>`);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    app.appendChild(wrap);
  });

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
        <p class="muted">These are the things your daily exercises draw from. Add whatever matters to you.</p>
      </div>`));

    // language switch
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
      // refresh switch active states
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
        el.querySelector('.rm').onclick = ()=>{
          state.workspace[lang] = state.workspace[lang].filter(x=>x.id!==item.id);
          save(); render(); toast('Removed');
        };
        grid.appendChild(el);
      });
      // add form
      const add = h(`
        <div class="ws-add">
          <div class="field">
            <label>New item</label>
            <input class="input" placeholder="e.g. The train station near home" />
          </div>
          <div class="field">
            <label>Note (optional)</label>
            <input class="input note" placeholder="a detail or two" />
          </div>
          <div class="emoji-pick"></div>
          <button class="cta block">＋ Add to workspace</button>
        </div>`);
      const ep = add.querySelector('.emoji-pick');
      EMOJIS.forEach(e=>{
        const b=h(`<button class="${e===picked?'sel':''}">${e}</button>`);
        b.onclick=()=>{ picked=e; ep.querySelectorAll('button').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); };
        ep.appendChild(b);
      });
      const input = add.querySelector('.input');
      const noteI = add.querySelector('.note');
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
  // VIEW: Exercise
  // =========================================================
  route('/exercise', (params) => {
    const lang = params.lang && LANGS[params.lang] ? params.lang : 'en';
    const items = state.workspace[lang];
    if(!items.length){
      app.appendChild(h(`<div class="center stack"><h1>No items yet</h1><p class="muted">Add something to your workspace first.</p><div><a class="cta" href="#/workspace?lang=${lang}" data-link>Go to workspace</a></div></div>`));
      return;
    }
    // pick a random item + random mode (kept for this render)
    let item = items[Math.floor(Math.random()*items.length)];
    let mode = Math.random() < 0.5 ? 'describe' : 'story';
    let recognition = null, recording = false;

    const wrap = h('<div class="ex-wrap"></div>');
    app.appendChild(wrap);

    function render(){
      wrap.innerHTML='';
      wrap.appendChild(h(`
        <div class="view-head row spread">
          <div><p class="eyebrow">${LANGS[lang].flag} ${LANGS[lang].name} · today's step</p></div>
          <a class="pill-btn" href="#/" data-link>← Hub</a>
        </div>`));

      const prompt = h(`
        <div class="prompt-card">
          <div class="who"><span class="emo">${item.emoji||'📌'}</span><span class="lbl">${esc(item.label)}</span></div>
          <div class="task">${PROMPTS[lang][mode](esc(item.label))}</div>
          <div class="mode-toggle">
            <button class="pill-btn ${mode==='describe'?'is-active':''}" data-m="describe">✍️ Describe it</button>
            <button class="pill-btn ${mode==='story'?'is-active':''}" data-m="story">📖 Tell a story</button>
            <button class="pill-btn" id="shuffle" title="Pick another item">🎲 Shuffle</button>
          </div>
        </div>`);
      prompt.querySelectorAll('[data-m]').forEach(b=> b.onclick=()=>{ mode=b.dataset.m; render(); });
      prompt.querySelector('#shuffle').onclick=()=>{ item=items[Math.floor(Math.random()*items.length)]; mode=Math.random()<0.5?'describe':'story'; render(); };
      wrap.appendChild(prompt);

      const editor = h(`
        <div>
          <div class="editor-toolbar">
            <button class="mic-btn" id="mic"><span class="mdot"></span> 🎤 Speak</button>
            <span class="wordcount" id="wc">0 words</span>
          </div>
          <textarea class="textarea compose" id="compose" placeholder="${lang==='de'?'Fang an zu schreiben … oder tippe auf „Speak".':'Start writing … or tap “Speak”.'}"></textarea>
          <div class="row" style="margin-top:var(--space-block)">
            <button class="cta secondary" id="submit">Finish &amp; get feedback →</button>
            <span class="muted" style="font-size:var(--text-caption)">Your coach will review, score, and build your vocabulary.</span>
          </div>
        </div>`);
      wrap.appendChild(editor);

      const ta = editor.querySelector('#compose');
      const wc = editor.querySelector('#wc');
      const updateWC = ()=>{ const n = ta.value.trim()?ta.value.trim().split(/\s+/).length:0; wc.textContent = n+' word'+(n===1?'':'s'); };
      ta.addEventListener('input', updateWC);

      // speech
      const micBtn = editor.querySelector('#mic');
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if(!SR){ micBtn.disabled=true; micBtn.title='Voice not supported in this browser'; micBtn.style.opacity=.5; }
      micBtn.onclick = ()=>{
        if(!SR) return;
        if(recording){ recognition && recognition.stop(); return; }
        recognition = new SR();
        recognition.lang = PROMPTS[lang].speechLang;
        recognition.interimResults = true; recognition.continuous = true;
        let base = ta.value ? ta.value+' ' : '';
        recognition.onstart = ()=>{ recording=true; micBtn.classList.add('recording'); micBtn.innerHTML='<span class="mdot"></span> ■ Stop'; };
        recognition.onerror = ()=>{ toast('Mic error — allow microphone access'); };
        recognition.onend = ()=>{ recording=false; micBtn.classList.remove('recording'); micBtn.innerHTML='<span class="mdot"></span> 🎤 Speak'; };
        recognition.onresult = (e)=>{
          let interim='', fin='';
          for(let i=e.resultIndex;i<e.results.length;i++){ const r=e.results[i]; if(r.isFinal) fin+=r[0].transcript; else interim+=r[0].transcript; }
          if(fin) base += fin+' ';
          ta.value = (base+interim).replace(/\s+/g,' '); updateWC();
        };
        recognition.start();
      };

      editor.querySelector('#submit').onclick = ()=>{
        const text = ta.value.trim();
        if(text.split(/\s+/).filter(Boolean).length < 3){ toast('Write a little more first (3+ words)'); ta.focus(); return; }
        if(recording && recognition) recognition.stop();
        showResult(text);
      };
      updateWC();
    }

    function showResult(text){
      const r = mockReview(text, lang);
      // persist exercise + vocab
      const ex = { id:uid(), lang, date:todayStr(), itemId:item.id, itemLabel:item.label, mode, input:text, score:r.score, review:r };
      state.exercises.push(ex);
      // merge vocab (dedupe by word)
      const have = new Set(state.vocab[lang].map(v=>v.word.toLowerCase()));
      r.vocab.forEach(v=>{ if(!have.has(v.word.toLowerCase())){ state.vocab[lang].push({...v, date:todayStr()}); have.add(v.word.toLowerCase()); }});
      const wasDone = doneToday(lang);
      completeToday(lang);
      save();

      wrap.innerHTML='';
      const st = state.langs[lang];
      wrap.appendChild(h(`
        <div class="view-head row spread">
          <div><p class="eyebrow">${LANGS[lang].flag} ${LANGS[lang].name} · review</p><h1>Nice work.</h1></div>
          <a class="pill-btn" href="#/" data-link>← Hub</a>
        </div>`));

      // score + AI panel
      const panel = h(`
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
        </div></div>`);
      wrap.appendChild(panel);

      // vocab
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

      // streak celebrate
      wrap.appendChild(h(`
        <div class="celebrate">
          <div class="big-foot">${FOOT_SVG}</div>
          <h2 style="margin:.2em 0">${wasDone?'Another step today':'🔥 '+st.streak+' day streak!'}</h2>
          <p class="muted">${wasDone?'You already stepped today — this one still counts as practice.':'Your footsteps trail just grew.'}</p>
          ${trailHTML(st.streak)}
          <div class="row" style="justify-content:center;margin-top:var(--space-block)">
            <a class="cta" href="#/" data-link>Back to hub</a>
            <a class="pill-btn" href="#/vocab?lang=${lang}" data-link>See all vocabulary</a>
          </div>
        </div>`));
      window.scrollTo({top:0,behavior:'smooth'});
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
        body.appendChild(h(`<div class="vocab-empty">No words yet. Finish an exercise to start your collection.<br/><br/><a class="cta" href="#/exercise?lang=${lang}" data-link>Start ${LANGS[lang].name} exercise</a></div>`));
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
