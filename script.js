(function(){
  // ---------- Ambient twinkles ----------
  var bg = document.getElementById('stage-bg');
  var twinkleCount = window.innerWidth < 500 ? 22 : 40;
  for (var i = 0; i < twinkleCount; i++){
    var t = document.createElement('div');
    t.className = 'twinkle';
    var size = Math.random() * 2.5 + 1;
    t.style.width = size + 'px';
    t.style.height = size + 'px';
    t.style.left = Math.random() * 100 + 'vw';
    t.style.top = Math.random() * 100 + 'vh';
    t.style.animationDuration = (2 + Math.random() * 3) + 's';
    t.style.animationDelay = (Math.random() * 3) + 's';
    bg.appendChild(t);
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Countdown ----------
  // Edit this date to match her real birthday.
  var BIRTHDAY_DATE = new Date('2026-07-15T00:00:00');

  var ddayBadge = document.getElementById('ddayBadge');
  var elDays = document.getElementById('cd-days');
  var elHours = document.getElementById('cd-hours');
  var elMins = document.getElementById('cd-mins');
  var elSecs = document.getElementById('cd-secs');

  function pad(n){ return n < 10 ? '0' + n : '' + n; }

  function tick(){
    var now = new Date();
    var diff = BIRTHDAY_DATE - now;

    if (diff <= 0){
      ddayBadge.textContent = 'D-DAY 🎉';
      elDays.textContent = '00'; elHours.textContent = '00';
      elMins.textContent = '00'; elSecs.textContent = '00';
      return;
    }
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var mins = Math.floor((diff / (1000 * 60)) % 60);
    var secs = Math.floor((diff / 1000) % 60);

    ddayBadge.textContent = 'D-' + days;
    elDays.textContent = pad(days); elHours.textContent = pad(hours);
    elMins.textContent = pad(mins); elSecs.textContent = pad(secs);
  }
  tick();
  setInterval(tick, 1000);

  // ---------- Particle burst helper ----------
  function spawnParticles(x, y, opts){
    if (reduceMotion) return;
    opts = opts || {};
    var count = opts.count || 18;
    var colors = opts.colors || ['#a874e8','#cbb0ef','#e8c468','#f4eefc'];
    var glyphs = opts.glyphs || null;
    var spreadMin = opts.spreadMin || 70;
    var spreadMax = opts.spreadMax || 160;

    for (var i = 0; i < count; i++){
      var el = document.createElement('span');
      el.className = 'particle' + (glyphs ? ' glyph' : '');
      if (glyphs){
        el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      } else {
        var size = 5 + Math.random() * 6;
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
      }
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      document.body.appendChild(el);

      var angle = Math.random() * Math.PI * 2;
      var distance = spreadMin + Math.random() * (spreadMax - spreadMin);
      var dx = Math.cos(angle) * distance;
      var dy = Math.sin(angle) * distance - 30;
      var rot = (Math.random() - 0.5) * 360;
      var duration = 700 + Math.random() * 500;

      el.animate([
        { transform: 'translate(-50%,-50%) translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: duration, easing: 'cubic-bezier(.2,.8,.2,1)' });

      (function(node, d){ setTimeout(function(){ node.remove(); }, d + 60); })(el, duration);
    }
  }

  // ---------- Background music ----------
  var bgMusic = document.getElementById('bgMusic');
  var muteBtn = document.getElementById('fsMute');
  bgMusic.loop = true;
  bgMusic.volume = 0.65;

  function playMusic(){
    // .loop = true already makes it repeat forever on its own,
    // this just (re)starts it the moment the balloon scene appears.
    var p = bgMusic.play();
    if (p && p.catch){ p.catch(function(){ /* ignore autoplay block until next tap */ }); }
  }

  function stopMusic(){
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  if (muteBtn){
    muteBtn.addEventListener('click', function(){
      bgMusic.muted = !bgMusic.muted;
      muteBtn.classList.toggle('muted', bgMusic.muted);
      muteBtn.textContent = bgMusic.muted ? '🔇' : '🔊';
    });
  }

  // ---------- Scene switching ----------
  var overlay = document.getElementById('fsOverlay');

  function goToScene(id){
    var current = overlay.querySelector('.scene.active');
    var next = document.getElementById(id);
    function showNext(){
      next.classList.add('active');
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){ next.classList.add('visible'); });
      });
      overlay.scrollTop = 0;
    }
    if (current && current !== next){
      current.classList.remove('visible');
      setTimeout(function(){
        current.classList.remove('active');
        showNext();
      }, 300);
    } else {
      showNext();
    }
  }

  function openExperience(){
    resetExperience();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    goToScene('scene-balloons');
    // Music starts right as the balloons appear, and its native loop
    // keeps it playing continuously through the cake and message scenes
    // for as long as the visitor stays on the page.
    playMusic();
  }

  function closeExperience(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    heart.classList.remove('lit');
    stopMusic();
  }

  document.getElementById('fsClose').addEventListener('click', closeExperience);

  // ---------- Balloons ----------
  var BALLOON_COLORS = [
    ['#a874e8','#5e3a94'],
    ['#e8c468','#c99f3c'],
    ['#cbb0ef','#8b5fbf'],
    ['#e894b5','#b45a80'],
    ['#8fd6d0','#3f9490'],
    ['#8b5fbf','#3d2560'],
    ['#f4eefc','#cbb0ef']
  ];
  var balloonsField = document.getElementById('balloonsField');
  var balloonCountEl = document.getElementById('balloonCount');
  var balloonDoneEl = document.getElementById('balloonDone');
  var poppedCount = 0;

  function buildBalloons(){
    balloonsField.innerHTML = '';
    poppedCount = 0;
    balloonCountEl.textContent = '0';
    balloonDoneEl.textContent = '';
    for (var i = 0; i < 7; i++){
      var wrap = document.createElement('div');
      wrap.className = 'balloon-wrap';
      wrap.style.setProperty('--bc1', BALLOON_COLORS[i][0]);
      wrap.style.setProperty('--bc2', BALLOON_COLORS[i][1]);
      wrap.style.animationDelay = (Math.random() * 1.5) + 's';
      wrap.dataset.index = i;

      var balloon = document.createElement('div');
      balloon.className = 'balloon';
      var string = document.createElement('div');
      string.className = 'balloon-string';

      wrap.appendChild(balloon);
      wrap.appendChild(string);
      balloonsField.appendChild(wrap);
    }
  }

  balloonsField.addEventListener('click', function(e){
    var wrap = e.target.closest('.balloon-wrap');
    if (!wrap || wrap.classList.contains('popped')) return;
    wrap.classList.add('popped');

    var rect = wrap.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    spawnParticles(cx, cy, {
      count: 12,
      colors: [wrap.style.getPropertyValue('--bc1'), wrap.style.getPropertyValue('--bc2'), '#f4eefc'],
      spreadMin: 40, spreadMax: 90
    });

    poppedCount++;
    balloonCountEl.textContent = poppedCount;

    if (poppedCount === 7){
      balloonDoneEl.textContent = 'All popped! On to the cake 🎂';
      setTimeout(function(){ goToScene('scene-cake'); }, 950);
    }
  });

  // ---------- Cake ----------
  var cakeStage = document.getElementById('cakeStage');
  var cakeHint = document.getElementById('cakeHint');
  var cakeDoneEl = document.getElementById('cakeDone');

  function cutCake(){
    if (cakeStage.classList.contains('done')) return;
    cakeStage.classList.add('done', 'swipe', 'blown');
    cakeHint.style.opacity = '0';

    var rect = cakeStage.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    setTimeout(function(){
      spawnParticles(cx, cy, { glyphs: ['💜','✨','🎉','⭐'], count: 20, spreadMin: 90, spreadMax: 180 });
      cakeDoneEl.textContent = 'Cake cut! Make a wish… 🌟';
    }, 550);

    setTimeout(function(){ goToScene('scene-message'); }, 1900);
  }

  cakeStage.addEventListener('click', cutCake);

  // ---------- Final scene ambient floats ----------
  var messageScene = document.getElementById('scene-message');
  var floatsSpawned = false;
  function spawnFloats(){
    if (floatsSpawned || reduceMotion) return;
    floatsSpawned = true;
    var glyphs = ['🎈','💜','✨'];
    for (var i = 0; i < 10; i++){
      var el = document.createElement('span');
      el.className = 'float-emoji';
      el.textContent = glyphs[i % glyphs.length];
      el.style.left = (Math.random() * 90 + 3) + '%';
      el.style.bottom = '-10%';
      el.style.animationDuration = (7 + Math.random() * 6) + 's';
      el.style.animationDelay = (Math.random() * 6) + 's';
      messageScene.appendChild(el);
    }
  }

  // ---------- Reset ----------
  function resetExperience(){
    buildBalloons();
    cakeStage.classList.remove('done','swipe','blown');
    cakeHint.style.opacity = '1';
    cakeDoneEl.textContent = '';
    document.querySelectorAll('.scene').forEach(function(s){
      s.classList.remove('active','visible');
    });
    spawnFloats();
  }

  // ---------- Heart trigger ----------
  var heart = document.getElementById('heartWrap');

  function startSurprise(){
    heart.classList.add('lit');
    var rect = heart.getBoundingClientRect();
    spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, {
      glyphs: ['💜','✨'], count: 14
    });
    setTimeout(openExperience, 400);
  }

  heart.addEventListener('click', startSurprise);
  heart.addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      startSurprise();
    }
  });
})();
