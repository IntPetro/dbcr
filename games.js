(() => {
  'use strict';
  const core = window.DBCR_CORE;
  const dialog = document.querySelector('#game-dialog');
  const content = document.querySelector('#game-content');
  const titles = { naman: ['Naman', 'Who are you, really?'], shiven: ['Shiven', 'Quick on the click'], ishan: ['Ishan', 'Words per minute'], shubh: ['Shubh', 'Somewhere on Earth'], harshit: ['Harshit', 'Clicks against the clock'], somil: ['Somil', 'Just one more jump'], vinayak: ['Vinayak', 'Nine by nine'] };
  let activeGame, opener, cleanup = () => {};
  const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  function button(text, action, className = 'primary-button') {
    const node = el('button', text, className);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }
  function stat(label, value) {
    const box = el('div', undefined, 'stat');
    const number = el('strong', value);
    box.append(number, el('span', label));
    return { box, number };
  }
  function renderGame() {
    cleanup();
    cleanup = () => {};
    content.replaceChildren();
    const [owner, title] = titles[activeGame];
    document.querySelector('#game-owner').textContent = owner + ' / mini game';
    document.querySelector('#game-title').textContent = title;
    ({ naman: quiz, shiven: reaction, ishan: typing, shubh: country, harshit: clicks, somil: jump, vinayak: sudoku })[activeGame]();
    dialog.scrollTop = 0;
  }
  function openGame(game, source) {
    if (dialog.open) return;
    activeGame = game;
    opener = source;
    renderGame();
    dialog.showModal();
    document.querySelector('#close-game').focus();
  }
  document.querySelector('#close-game').addEventListener('click', () => dialog.close());
  document.querySelector('#restart-game').addEventListener('click', renderGame);
  dialog.addEventListener('close', () => { cleanup(); cleanup = () => {}; content.replaceChildren(); opener?.focus(); });
  // Native dialog handles Escape, focus containment, and inert background content.
  for (const tile of document.querySelectorAll('[data-game]')) {
    let timer, start, pointer;
    const cancel = () => { clearTimeout(timer); tile.classList.remove('holding'); pointer = undefined; };
    tile.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      cancel();
      start = { x: event.clientX, y: event.clientY };
      pointer = event.pointerId;
      tile.setPointerCapture(pointer);
      tile.classList.add('holding');
      timer = setTimeout(() => { cancel(); openGame(tile.dataset.game, tile); }, 550);
    });
    tile.addEventListener('pointermove', event => {
      if (pointer === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) cancel();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => tile.addEventListener(type, cancel));
    tile.addEventListener('contextmenu', event => event.preventDefault());
    tile.addEventListener('click', event => { if (event.detail === 0) openGame(tile.dataset.game, tile); });
    window.addEventListener('blur', cancel);
  }

  const archetypes = [
    ['The Strategist', 'You like making sense of things. You bring a clear head, a good plan, and the patience to think a few moves ahead.'],
    ['The Explorer', 'Curiosity is your compass. You bring energy, spontaneity, and a willingness to try the thing nobody else has tried.'],
    ['The Connector', 'People are your superpower. You listen, bring everyone into the conversation, and make a group feel like a group.'],
    ['The Creator', 'You see possibilities in ordinary things. You bring imagination, your own perspective, and ideas that take the conversation somewhere new.']
  ];
  const questions = [
    ['A free Saturday appears. What do you do?', ['Plan a satisfying day and tick things off.', 'Head somewhere new and see what happens.', 'Find out who is free to hang out.', 'Start a project just for the fun of it.']],
    ['The group is planning a trip. You are the one who…', ['Figures out the route and budget.', 'Suggests the unexpected destination.', 'Makes sure everyone can come.', 'Dreams up a theme or a unique experience.']],
    ['You get a tricky problem. Your first move?', ['Break it into smaller steps.', 'Try something and learn as you go.', 'Talk it through with someone.', 'Look for a completely different angle.']],
    ['Pick the compliment that means the most.', ['“You always figure it out.”', '“Life is more exciting with you.”', '“You make people feel understood.”', '“Nobody thinks quite like you.”']],
    ['A plan falls apart at the last minute. You…', ['Build a practical backup plan.', 'Enjoy the unexpected detour.', 'Check that everyone is doing okay.', 'Turn the situation into something new.']],
    ['Which challenge would you pick?', ['A puzzle with a clever solution.', 'An activity you have never tried.', 'A team challenge with your friends.', 'Making something from a blank page.']],
    ['At a gathering, you tend to…', ['Find a conversation with some depth.', 'Move around and discover what is happening.', 'Introduce people and keep the mood warm.', 'Bring up a strange but interesting idea.']],
    ['When learning something, you prefer to…', ['Understand how the whole thing works.', 'Jump in and experiment.', 'Learn alongside someone else.', 'Make your own version of it.']],
    ['You would rather be remembered for…', ['Your judgment and dependability.', 'Your courage and adventurous spirit.', 'Your kindness and friendships.', 'Your imagination and originality.']],
    ['The group needs a boost. You bring…', ['A clear next step.', 'A spontaneous new plan.', 'A check-in and a laugh.', 'An idea nobody saw coming.']]
  ];
  function quiz() {
    let index = 0;
    const answers = Array(10).fill(null);
    function draw() {
      content.replaceChildren(el('p', 'Ten questions, four possible vibes. Pick what feels most like you. Just for fun.', 'game-description'));
      content.append(el('div', `Question ${index + 1} of 10`, 'small'));
      const progress = el('div', undefined, 'progress');
      const fill = el('div'); fill.style.width = `${index / 10 * 100}%`; progress.append(fill);
      const heading = el('h3', questions[index][0], 'question'); heading.tabIndex = -1;
      content.append(progress, heading);
      const options = el('div', undefined, 'options');
      const next = button(index === 9 ? 'See my personality' : 'Next question', () => {
        if (answers[index] === null) return;
        if (index === 9) finish(); else { index++; draw(); content.querySelector('.question').focus(); }
      });
      next.disabled = answers[index] === null;
      questions[index][1].forEach((text, answer) => {
        const option = button(text, () => {
          answers[index] = answer;
          [...options.children].forEach((node, i) => { node.classList.toggle('selected', i === answer); node.setAttribute('aria-pressed', String(i === answer)); });
          next.disabled = false;
        }, 'option' + (answers[index] === answer ? ' selected' : ''));
        option.setAttribute('aria-pressed', String(answers[index] === answer));
        options.append(option);
      });
      const nav = el('div', undefined, 'nav-row');
      const back = button('Back', () => { index--; draw(); content.querySelector('.question').focus(); }, 'quiet-button'); back.disabled = index === 0;
      nav.append(back, next); content.append(options, nav);
    }
    function finish() {
      const result = core.personality(answers);
      content.replaceChildren(el('p', 'Your personality mix', 'eyebrow'));
      const panel = el('div', undefined, 'result');
      const heading = el('h3', result.winners.map(i => archetypes[i][0]).join(' + ')); heading.tabIndex = -1;
      panel.append(heading, el('p', result.winners.map(i => archetypes[i][1]).join(' ')));
      content.append(panel, el('p', result.winners.length > 1 ? 'A tie! Your answers lean equally toward these personalities.' : 'Your strongest match, based on the choices you made.', 'small'));
      const list = el('ul', undefined, 'attempts');
      result.scores.forEach((score, i) => list.append(el('li', `${archetypes[i][0]}: ${score} / 10 choices`)));
      content.append(list, el('p', 'A playful quiz, not a psychological assessment.', 'small')); heading.focus();
    }
    draw();
  }

  function reaction() {
    content.append(el('p', 'Wait until the box turns green and says “Go!”, then react. Five valid tries; early clicks do not count. Use a click, tap, Space, or Enter.', 'game-description'));
    const stats = el('div', undefined, 'stats');
    const tries = stat('Valid tries', '0 / 5'), last = stat('Last try', '—'), average = stat('Average', '—');
    stats.append(tries.box, last.box, average.box);
    const pad = el('button', 'Start test', 'reaction-pad'); pad.type = 'button';
    const message = el('p', 'Ready when you are.', 'feedback'); message.setAttribute('role', 'status');
    const history = el('ol', undefined, 'attempts');
    content.append(pad, stats, message, history);
    let phase = 'idle', timer, greenAt, frame;
    const scores = [];
    function begin() {
      phase = 'wait'; pad.className = 'reaction-pad wait'; pad.textContent = 'Wait…'; message.textContent = 'Watch for green.';
      timer = setTimeout(() => {
        frame = requestAnimationFrame(() => {
          phase = 'ready'; pad.className = 'reaction-pad ready'; pad.textContent = 'Go!'; greenAt = performance.now();
        });
      }, 1500 + Math.random() * 2500);
    }
    function hit() {
      if (phase === 'done') return;
      if (phase === 'idle' || phase === 'next' || phase === 'early') { begin(); return; }
      if (phase === 'wait') {
        clearTimeout(timer); cancelAnimationFrame(frame); phase = 'early'; pad.className = 'reaction-pad early'; pad.textContent = 'Too soon. Try again';
        message.textContent = 'That click did not count. Click to try the same round again.'; return;
      }
      const ms = performance.now() - greenAt;
      scores.push(ms);
      tries.number.textContent = `${scores.length} / 5`; last.number.textContent = `${Math.round(ms)} ms`;
      average.number.textContent = `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)} ms`;
      history.append(el('li', `Try ${scores.length}: ${Math.round(ms)} ms`));
      phase = scores.length === 5 ? 'done' : 'next'; pad.className = 'reaction-pad';
      pad.textContent = phase === 'done' ? 'Five tries complete' : 'Next try'; pad.disabled = phase === 'done';
      message.textContent = phase === 'done' ? `Your average reaction time is ${average.number.textContent}. Restart for another five tries.` : 'Nice. Click when you are ready for the next try.';
    }
    pad.addEventListener('pointerdown', e => { if (e.button === 0 && e.isPrimary) { e.preventDefault(); pad.focus(); hit(); } });
    pad.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) hit(); } });
    // Assistive technology can activate the button without a pointer or key event.
    pad.addEventListener('click', e => { if (e.detail === 0 && phase !== 'done') hit(); });
    const hidden = () => {
      if (document.hidden && (phase === 'ready' || phase === 'wait')) {
        clearTimeout(timer); cancelAnimationFrame(frame); phase = 'idle'; pad.className = 'reaction-pad'; pad.textContent = 'Resume test';
        message.textContent = 'Round paused while this tab was hidden. No score was recorded.';
      }
    };
    document.addEventListener('visibilitychange', hidden);
    cleanup = () => { clearTimeout(timer); cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', hidden); };
  }

  const wordPool = 'orbit cactus velvet ladder piano glacier lemon compass thunder pocket marble bicycle whisper forest copper lantern biscuit galaxy anchor meadow robot tunnel sapphire feather kettle puzzle banana rocket pebble window ribbon dolphin canvas magnet sunset pillow cobweb pepper island kettle tractor rainbow button waffle planet guitar crystal candle penguin silver hammock cloud dragon notebook mountain cherry ocean helmet violin tulip zipper comet carpet mushroom breeze balloon canoe diamond koala walnut engine coral jacket castle noodle spiral acorn telescope orange prism cricket toast river zebra umbrella domino avalanche popcorn museum satellite apron walnut'.split(' ');
  function typing() {
    const pool = [...new Set(wordPool)];
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const words = pool.slice(0, 35), target = words.join(' ');
    content.append(el('p', 'Type these 35 unrelated words in order, separated by single spaces. The timer starts on your first character. Correct mistakes with Backspace.', 'game-description'));
    const stats = el('div', undefined, 'stats');
    const speed = stat('Words / minute', '0'), accuracy = stat('Accuracy', '100%'), elapsed = stat('Seconds', '0.0');
    stats.append(speed.box, accuracy.box, elapsed.box);
    const prompt = el('div', undefined, 'word-prompt'); prompt.setAttribute('aria-label', 'Words to type');
    const spans = words.map((word, i) => { const span = el('span', word); prompt.append(span); if (i < words.length - 1) prompt.append(document.createTextNode(' ')); return span; });
    const label = el('label', 'Your typing', 'field-label'); label.htmlFor = 'typing-input';
    const input = el('textarea'); input.id = 'typing-input'; input.spellcheck = false; input.autocomplete = 'off'; input.autocapitalize = 'off'; input.setAttribute('autocorrect', 'off'); input.placeholder = 'Start typing here…';
    const status = el('p', '0 / 35 words entered', 'feedback'); status.setAttribute('role', 'status');
    const finish = button('Finish test', () => end()); finish.disabled = true;
    content.append(stats, prompt, label, input, status, finish, el('p', 'WPM uses correct characters ÷ 5 ÷ minutes. Final accuracy also counts missing characters. Pasting is disabled.', 'small'));
    let started = null, interval, done = false;
    function update() {
      const duration = started === null ? 0 : performance.now() - started;
      const metrics = core.typingMetrics(input.value, target, duration, done);
      speed.number.textContent = String(metrics.wpm); accuracy.number.textContent = `${metrics.accuracy}%`; elapsed.number.textContent = (duration / 1000).toFixed(1);
      return metrics;
    }
    function end() {
      if (done || started === null || input.value.trim().split(/\s+/).length < 35) return;
      done = true; clearInterval(interval); update(); input.readOnly = true; finish.disabled = true;
      status.textContent = `Complete! ${speed.number.textContent} WPM with ${accuracy.number.textContent} accuracy. Restart for a new set of words.`;
    }
    input.addEventListener('input', () => {
      if (done) return;
      if (started === null && input.value.length) { started = performance.now(); interval = setInterval(update, 100); }
      const typed = input.value.split(' ');
      spans.forEach((span, i) => {
        const current = i === typed.length - 1;
        span.className = i < typed.length - 1 ? (typed[i] === words[i] ? 'correct' : 'incorrect') : current ? 'current' + (words[i].startsWith(typed[i]) ? '' : ' incorrect') : '';
      });
      const count = input.value.trim() ? input.value.trim().split(/\s+/).length : 0;
      status.textContent = `${Math.min(count, 35)} / 35 words entered`;
      finish.disabled = count < 35; update();
      if (input.value === target || (count >= 35 && /\s$/.test(input.value))) end();
    });
    ['paste', 'drop'].forEach(type => input.addEventListener(type, e => { e.preventDefault(); status.textContent = 'Type the words yourself to measure your speed.'; }));
    cleanup = () => clearInterval(interval);
  }

  function clicks() {
    content.append(el('p', 'Choose a duration, then click or tap as fast as you can. Your first click starts the clock and counts toward your score.', 'game-description'));
    const modes = el('div', undefined, 'mode-row'); modes.setAttribute('role', 'group'); modes.setAttribute('aria-label', 'Test duration');
    let seconds = 5, started = null, count = 0, timer, done = false;
    const stats = el('div', undefined, 'stats');
    const total = stat('Clicks', '0'), time = stat('Seconds left', '5.0'), cps = stat('Clicks / second', '0.00');
    stats.append(total.box, time.box, cps.box);
    const pad = el('button', 'Click to start', 'reaction-pad cps-pad'); pad.type = 'button';
    const status = el('p', 'Choose 3, 5, or 10 seconds.', 'feedback'); status.setAttribute('role', 'status');
    const buttons = [3,5,10].map(duration => {
      const choice = button(`${duration} seconds`, () => {
        if (started !== null) return;
        seconds = duration; time.number.textContent = seconds.toFixed(1);
        buttons.forEach((b,i) => b.setAttribute('aria-pressed', String([3,5,10][i] === seconds)));
      }, 'quiet-button'); choice.setAttribute('aria-pressed', String(duration === seconds)); return choice;
    });
    modes.append(...buttons); content.append(modes, stats, pad, status);
    function update() {
      if (started === null || done) return;
      const duration = performance.now() - started;
      time.number.textContent = Math.max(0, seconds - duration / 1000).toFixed(1);
      cps.number.textContent = (count / Math.max(.001, Math.min(seconds, duration / 1000))).toFixed(2);
      if (duration >= seconds * 1000) {
        done = true; clearInterval(timer); pad.disabled = true; pad.textContent = 'Time’s up';
        cps.number.textContent = (count / seconds).toFixed(2);
        status.textContent = `${count} clicks in ${seconds} seconds. Your speed: ${cps.number.textContent} CPS. Restart to try again.`;
      }
    }
    pad.addEventListener('click', () => {
      if (done) return;
      if (started !== null && performance.now() - started >= seconds * 1000) { update(); return; }
      if (started === null) {
        started = performance.now(); buttons.forEach(b => b.disabled = true); timer = setInterval(update, 25);
        status.textContent = 'Keep clicking!'; pad.textContent = 'Click!';
      }
      count++; total.number.textContent = String(count); update();
    });
    // Holding a key must not generate a stream of artificial clicks.
    pad.addEventListener('keydown', event => { if (event.repeat && [' ', 'Enter'].includes(event.key)) event.preventDefault(); });
    cleanup = () => clearInterval(timer);
  }

  function jump() {
    content.append(el('p', 'Bounce up the platforms and keep climbing. Move with ← / → or A / D; on touch, hold the left and right buttons. Cross an edge to wrap around. Don’t fall!', 'game-description'));
    const stats = el('div', undefined, 'stats');
    const height = stat('Height', '0'), landings = stat('Landings', '0'), state = stat('Status', 'Ready'); stats.append(height.box, landings.box, state.box);
    const stage = el('div', undefined, 'jump-stage');
    const canvas = el('canvas'); canvas.width = 360; canvas.height = 460; canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', 'Platform jumping game. Use left and right arrows or A and D to move.');
    canvas.setAttribute('role', 'img'); canvas.dataset.state = 'ready';
    const overlay = el('div', undefined, 'jump-overlay');
    const overlayText = el('p', 'How high can you go?');
    const startButton = button('Start jumping', start);
    overlay.append(overlayText, startButton); stage.append(canvas, overlay);
    const controls = el('div', undefined, 'jump-controls');
    const left = button('Move left', () => {}, 'quiet-button'), pause = button('Pause', togglePause, 'quiet-button'), right = button('Move right', () => {}, 'quiet-button'); pause.disabled = true;
    controls.append(left, pause, right);
    const status = el('p', 'Land on a platform to jump automatically.', 'feedback'); status.setAttribute('role', 'status');
    content.append(stats, stage, controls, status);
    const ctx = canvas.getContext('2d'), W = 360, H = 460;
    const player = { x: 168, y: 378, w:24, h:24, vy:-620 };
    let platforms = [{x:138,y:405,w:84,speed:0}], phase = 'ready', frame, lastTime, camera = 0, score = 0, bounces = 0;
    const held = new Set();
    function generate() {
      while (platforms.at(-1).y > -100) {
        const previous = platforms.at(-1), w = score > 1000 ? 68 : 84;
        platforms.push({x: Math.max(0, Math.min(W - w, previous.x + (Math.random() - .5) * 160)), y: previous.y - 70 - Math.random() * 25, w, speed: score > 500 && Math.random() < .2 ? (Math.random() < .5 ? -35 : 35) : 0});
      }
    }
    generate();
    function draw() {
      ctx.fillStyle = '#f1f4e9'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle = '#e0e6d4'; ctx.lineWidth = 1;
      for(let x=0;x<W;x+=24) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for(let y=(camera%24);y<H;y+=24) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      platforms.forEach(p => { ctx.fillStyle = p.speed ? '#627641' : '#9ebd45'; ctx.fillRect(p.x,p.y,p.w,9); ctx.fillStyle = '#465626'; ctx.fillRect(p.x,p.y,p.w,2); });
      ctx.fillStyle = '#191b18'; ctx.fillRect(player.x,player.y,player.w,player.h);
      ctx.fillStyle = '#d8f36a'; ctx.fillRect(player.x+5,player.y+7,4,4); ctx.fillRect(player.x+15,player.y+7,4,4);
    }
    function changePhase(next) { phase = next; canvas.dataset.state = next; state.number.textContent = {running:'Jumping',paused:'Paused',over:'Game over',ready:'Ready'}[next]; }
    function start() {
      if (phase === 'over') { renderGame(); return; }
      changePhase('running'); overlay.hidden = true; pause.disabled = false; pause.textContent = 'Pause'; lastTime = performance.now();
      canvas.focus(); frame = requestAnimationFrame(loop);
    }
    function togglePause() {
      if (phase === 'running') {
        changePhase('paused'); cancelAnimationFrame(frame); held.clear(); overlay.hidden = false; overlayText.textContent = 'Take a breath.'; startButton.textContent = 'Resume jumping'; pause.textContent = 'Resume';
      } else if (phase === 'paused') start();
    }
    function step(dt) {
      const direction = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0);
      player.x += direction * 240 * dt;
      if(player.x > W) player.x = -player.w; if(player.x < -player.w) player.x = W;
      const oldBottom = player.y + player.h;
      player.vy += 1500 * dt; player.y += player.vy * dt;
      for (const p of platforms) {
        p.x += p.speed * dt;
        if (p.x < 0 || p.x + p.w > W) { p.x = Math.max(0, Math.min(W-p.w,p.x)); p.speed *= -1; }
        if (player.vy > 0 && oldBottom <= p.y && player.y + player.h >= p.y && player.x + player.w > p.x && player.x < p.x+p.w) {
          player.y = p.y - player.h; player.vy = -620; bounces++; landings.number.textContent = String(bounces); break;
        }
      }
      if (player.y < 180) {
        const offset = 180 - player.y; camera += offset; player.y += offset; platforms.forEach(p => p.y += offset);
        platforms = platforms.filter(p => p.y < H+30); generate();
      }
      score = Math.max(score, Math.floor(camera + 378 - player.y)); height.number.textContent = String(score); canvas.dataset.score = String(score);
      if(player.y > H) {
        changePhase('over'); pause.disabled = true; held.clear(); overlay.hidden = false; overlayText.textContent = `You climbed ${score} points.`; startButton.textContent = 'Play again';
        status.textContent = `Game over. Height: ${score}; ${bounces} platform landings.`;
      }
    }
    function loop(now) {
      if (phase !== 'running') return;
      let dt = Math.min(.1, Math.max(0, (now-lastTime)/1000)); lastTime = now;
      while (dt > 0 && phase === 'running') { const slice = Math.min(dt, 1/120); step(slice); dt -= slice; }
      draw(); if (phase === 'running') frame = requestAnimationFrame(loop);
    }
    const keyDirection = key => ['ArrowLeft','a','A'].includes(key) ? 'left' : ['ArrowRight','d','D'].includes(key) ? 'right' : null;
    const down = event => { const direction = keyDirection(event.key); if(direction) { event.preventDefault(); if(phase === 'running') held.add(direction); } };
    const up = event => { const direction = keyDirection(event.key); if(direction) { event.preventDefault(); held.delete(direction); } };
    const blur = () => { held.clear(); if (phase === 'running') togglePause(); };
    const hidden = () => { if(document.hidden) blur(); };
    const controller = new AbortController(), options = { signal:controller.signal };
    window.addEventListener('keydown',down,options); window.addEventListener('keyup',up,options); window.addEventListener('blur',blur,options); document.addEventListener('visibilitychange',hidden,options);
    [[left,'left'],[right,'right']].forEach(([control,direction]) => {
      control.style.touchAction = 'none';
      control.addEventListener('pointerdown', e => { if(e.button !== 0) return; e.preventDefault(); control.setPointerCapture(e.pointerId); if(phase === 'running') held.add(direction); });
      ['pointerup','pointercancel','lostpointercapture'].forEach(type => control.addEventListener(type,()=>held.delete(direction)));
    });
    draw(); cleanup = () => { cancelAnimationFrame(frame); controller.abort(); held.clear(); };
  }

  function sudoku() {
    const { puzzle, solution } = core.generateSudoku();
    const values = [...puzzle], cells = []; let selected = values.findIndex(v => !v), finished = false, started = null, timer, hints = 0;
    content.append(el('p', 'Fill every row, column, and 3×3 box with 1–9. Each new puzzle is randomized and has one solution. Select a cell, then type a digit or use the number pad.', 'game-description'));
    const stats = el('div', undefined, 'stats');
    const filled = stat('Filled cells', ''), time = stat('Time', '0:00'), hintCount = stat('Hints used', '0'); stats.append(filled.box, time.box, hintCount.box);
    const grid = el('div', undefined, 'sudoku-grid'); grid.setAttribute('role','group'); grid.setAttribute('aria-label','Sudoku board');
    const status = el('p','Select an empty cell to begin. Arrow keys move between cells.', 'feedback'); status.setAttribute('role','status');
    function isPeer(a,b) { return Math.floor(a/9) === Math.floor(b/9) || a%9 === b%9 || (Math.floor(a/27) === Math.floor(b/27) && Math.floor(a%9/3) === Math.floor(b%9/3)); }
    function conflict(i) { return values[i] && values.some((v,j) => j !== i && v === values[i] && isPeer(i,j)); }
    function select(i, focus = false) { selected = i; refresh(); if(focus) cells[i].focus(); }
    function refresh() {
      cells.forEach((cell,i) => {
        cell.textContent = values[i] || '';
        cell.classList.toggle('chosen',i===selected); cell.classList.toggle('peer',i!==selected && isPeer(i,selected));
        cell.classList.toggle('same-number',values[i] && values[i]===values[selected]); cell.classList.toggle('conflict',Boolean(conflict(i)));
        cell.setAttribute('aria-label',`Row ${Math.floor(i/9)+1}, column ${i%9+1}, ${values[i] || 'empty'}${puzzle[i] ? ', given' : ''}${conflict(i) ? ', conflict' : ''}`);
        cell.setAttribute('aria-pressed',String(i===selected)); cell.tabIndex = i === selected ? 0 : -1;
      });
      filled.number.textContent = `${values.filter(Boolean).length} / 81`;
      if(!finished && values.every((v,i)=>v===solution[i])) {
        finished = true; clearInterval(timer); numberButtons.forEach(b=>b.disabled=true); erase.disabled=true; hint.disabled=true; check.disabled=true;
        status.textContent = `Solved! Time: ${time.number.textContent}. Hints used: ${hints}. Restart for a new puzzle.`;
      }
    }
    function startTimer() {
      if(started !== null) return;
      started = performance.now(); timer = setInterval(()=> { const seconds = Math.floor((performance.now()-started)/1000); time.number.textContent = `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`; },1000);
    }
    function enter(value) {
      if(finished) return;
      if(puzzle[selected]) { status.textContent = 'That number is a given. Choose an empty cell.'; return; }
      if(values[selected] !== value) startTimer(); values[selected] = value; cells[selected].classList.remove('wrong'); refresh();
      if(!finished) status.textContent = conflict(selected) ? 'That number conflicts with this row, column, or box.' : value ? 'Number entered.' : 'Cell cleared.';
    }
    for(let i=0;i<81;i++) {
      const cell = button('',()=>select(i),'sudoku-cell' + (puzzle[i] ? ' given' : ''));
      if(i%9 === 2 || i%9 === 5) cell.classList.add('box-right'); if(Math.floor(i/9)===2 || Math.floor(i/9)===5) cell.classList.add('box-bottom');
      cell.addEventListener('keydown',event=> {
        if(/^[1-9]$/.test(event.key)) { event.preventDefault(); enter(Number(event.key)); }
        else if(['Backspace','Delete','0'].includes(event.key)) { event.preventDefault(); enter(0); }
        else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
          event.preventDefault(); const row = Math.floor(selected/9), col = selected%9;
          const r = Math.max(0,Math.min(8,row+(event.key==='ArrowDown'?1:event.key==='ArrowUp'?-1:0)));
          const c = Math.max(0,Math.min(8,col+(event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0))); select(r*9+c,true);
        }
      }); cells.push(cell); grid.append(cell);
    }
    const numbers = el('div',undefined,'sudoku-numbers'); numbers.setAttribute('role','group'); numbers.setAttribute('aria-label','Enter a number');
    const numberButtons = [1,2,3,4,5,6,7,8,9].map(n=>button(String(n),()=>enter(n),'quiet-button')); numbers.append(...numberButtons);
    const actions = el('div',undefined,'mode-row');
    const erase = button('Erase',()=>enter(0),'quiet-button');
    const check = button('Check board',()=> {
      const wrong = values.reduce((n,v,i)=>n+Boolean(v && v!==solution[i]),0);
      cells.forEach((cell,i)=>cell.classList.toggle('wrong',Boolean(values[i] && values[i]!==solution[i])));
      status.textContent = wrong ? `${wrong} ${wrong===1?'entry needs':'entries need'} another look. Highlighted in red.` : 'All entered numbers are correct so far.';
    },'quiet-button');
    const hint = button('Hint',()=> {
      if(finished) return;
      let cell = !puzzle[selected] && values[selected]!==solution[selected] ? selected : values.findIndex((v,i)=>v!==solution[i]);
      if(cell < 0) return;
      startTimer(); hints++; hintCount.number.textContent = String(hints); values[cell]=solution[cell]; select(cell); cells[cell].classList.remove('wrong');
      if(!finished) status.textContent = `Hint filled row ${Math.floor(cell/9)+1}, column ${cell%9+1}.`;
    },'quiet-button'); actions.append(erase,check,hint);
    content.append(stats,grid,numbers,actions,status); refresh();
    // Clear a previous check marker when that entry is edited.
    numbers.addEventListener('click',()=>cells[selected].classList.remove('wrong'));
    grid.addEventListener('keydown',e=> { if(/^[1-9]$/.test(e.key)||['Delete','Backspace','0'].includes(e.key)) cells[selected].classList.remove('wrong'); });
    cleanup = ()=>clearInterval(timer);
  }

  function country() {
    const countries = window.DBCR_COUNTRIES;
    if (!Array.isArray(countries) || !countries.length) { content.append(el('p', 'Country data could not load. Reload the page and try again.', 'game-description')); return; }
    const target = countries[Math.floor(Math.random() * countries.length)];
    const guesses = [], max = 8;
    content.append(el('p', 'A country is hidden. You have eight guesses. Each miss gives the approximate distance and direction from your guess to the answer, plus a new clue.', 'game-description'));
    const form = el('form', undefined, 'guess-form');
    const field = el('div', undefined, 'field');
    const label = el('label', 'Guess a country', 'field-label'); label.htmlFor = 'country-input';
    const input = el('input', undefined, 'country-input'); input.id = 'country-input'; input.setAttribute('list', 'country-options'); input.autocomplete = 'off'; input.placeholder = 'Start typing a country…'; input.required = true;
    const list = el('datalist'); list.id = 'country-options'; countries.forEach(c => { const option = el('option'); option.value = c.name; list.append(option); });
    const submit = el('button', 'Guess', 'primary-button'); submit.type = 'submit';
    field.append(label, input, list); form.append(field, submit);
    const feedback = el('p', '0 / 8 guesses', 'feedback'); feedback.setAttribute('role', 'status');
    const clues = el('div', undefined, 'clues'); clues.hidden = true; clues.setAttribute('aria-live', 'polite');
    const wrap = el('div', undefined, 'table-wrap');
    const table = el('table'); const caption = el('caption', 'Your guesses'); caption.className = 'small';
    const head = el('thead'); const row = el('tr'); ['Country', 'Distance', 'Direction', 'Progress'].forEach(t => row.append(el('th', t))); head.append(row);
    const body = el('tbody'); table.append(caption, head, body); wrap.append(table); wrap.hidden = true;
    content.append(form, feedback, clues, wrap);
    const note = el('p', 'Distances use representative country coordinates, not borders. Direction points from your guess toward the answer. ', 'small');
    const link = el('a', 'Country data', 'source-link'); link.href = 'https://github.com/mledoze/countries'; link.target = '_blank'; link.rel = 'noopener noreferrer'; note.append(link); content.append(note);
    let done = false;
    const aliases = { usa: 'USA', us: 'USA', uk: 'GBR', britain: 'GBR', southkorea: 'KOR', northkorea: 'PRK', russia: 'RUS', vietnam: 'VNM', czechrepublic: 'CZE', turkey: 'TUR', ivorycoast: 'CIV', drc: 'COD', uae: 'ARE', vatican: 'VAT' };
    form.addEventListener('submit', event => {
      event.preventDefault(); if (done) return;
      const value = core.normalize(input.value);
      const guess = countries.find(c => c.code === aliases[value] || [c.name, c.code, ...c.aliases].some(name => core.normalize(name) === value));
      if (!guess) { feedback.textContent = 'Choose a country from the suggestions. This did not use a guess.'; return; }
      if (guesses.some(g => g.country.code === guess.code)) { feedback.textContent = 'You already tried that country. Pick another; this did not use a guess.'; return; }
      const geo = core.geography(guess, target);
      const previous = guesses.at(-1);
      const won = guess.code === target.code;
      let progress = won ? 'Found it!' : previous ? (geo.distance < previous.distance ? 'Warmer' : geo.distance > previous.distance ? 'Colder' : 'Same distance') : 'First guess';
      if (!won && guess.borders.includes(target.code)) progress += ' · Neighbours';
      guesses.push({ country: guess, distance: geo.distance });
      const tr = el('tr'); [guess.name, won ? '0 km' : `${geo.distance.toLocaleString()} km`, won ? '—' : geo.direction, progress].forEach(t => tr.append(el('td', t))); body.prepend(tr); wrap.hidden = false;
      clues.hidden = false; clues.replaceChildren();
      const hints = [
        `Region: ${target.region}.`,
        `It ${target.landlocked ? 'is landlocked' : 'has a coastline'}.`,
        `Subregion: ${target.subregion}.`,
        `Its name has ${target.name.replace(/[^a-z]/gi, '').length} letters (ignoring spaces and punctuation).`,
        `Its name starts with ${target.name[0]}.`,
        `Capital: ${target.capital || 'No capital listed'}.`,
        `Its name starts with “${target.name.slice(0, 3)}”.`
      ];
      hints.slice(0, Math.min(guesses.length, hints.length)).forEach(hint => clues.append(el('p', hint)));
      done = won || guesses.length === max;
      feedback.textContent = won ? `You found ${target.name} in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}!` : done ? `Out of guesses. The answer was ${target.name}. Restart to find another country.` : `${guesses.length} / 8 guesses. ${progress}. Keep going!`;
      input.value = ''; input.disabled = done; submit.disabled = done; if (!done) input.focus();
    });
  }
})();
