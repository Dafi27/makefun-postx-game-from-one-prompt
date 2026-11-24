// Meteor Dodge — built from one prompt:
// "Build a tiny one-screen browser game: a rocket dodges falling meteors.
//  Arrow keys or WASD to move, score counts seconds survived, game over on
//  hit, press R to restart."
(function () {
  'use strict';

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('score');
  var overlay = document.getElementById('overlay');
  var gameoverEl = document.getElementById('gameover');
  var finalScoreEl = document.getElementById('finalScore');
  var startBtn = document.getElementById('startBtn');

  var W = 0, H = 0;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Starfield background, generated once per resize.
  var stars = [];
  function makeStars() {
    stars = [];
    var n = Math.floor((W * H) / 9000);
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        tw: Math.random() * Math.PI * 2
      });
    }
  }
  makeStars();
  window.addEventListener('resize', makeStars);

  var keys = {};
  var pointer = null;
  window.addEventListener('keydown', function (e) {
    keys[e.key.toLowerCase()] = true;
    if (state === 'over' && (e.key === 'r' || e.key === 'R')) start();
    if (state === 'menu' && (e.key === 'Enter' || e.key === ' ')) start();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(e.key.toLowerCase()) >= 0) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', function (e) {
    keys[e.key.toLowerCase()] = false;
  });
  canvas.addEventListener('pointermove', function (e) {
    pointer = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerdown', function (e) {
    pointer = { x: e.clientX, y: e.clientY };
    if (state === 'over') start();
  });
  startBtn.addEventListener('click', start);
  gameoverEl.addEventListener('click', start);

  var state = 'menu'; // menu | playing | over
  var rocket, meteors, particles, elapsed, spawnTimer, lastTime;

  function reset() {
    rocket = { x: W / 2, y: H * 0.72, vx: 0, vy: 0, r: 16 };
    meteors = [];
    particles = [];
    elapsed = 0;
    spawnTimer = 0;
    lastTime = performance.now();
  }

  function start() {
    reset();
    state = 'playing';
    overlay.classList.add('hidden');
    gameoverEl.classList.add('hidden');
  }

  function spawnMeteor() {
    var r = 12 + Math.random() * 26;
    var speed = 140 + Math.random() * 160 + elapsed * 6;
    meteors.push({
      x: Math.random() * (W - 2 * r) + r,
      y: -r,
      r: r,
      vy: speed,
      vx: (Math.random() - 0.5) * 60,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 2,
      craters: [
        { dx: -0.3, dy: 0.2, r: 0.35 },
        { dx: 0.35, dy: -0.25, r: 0.25 },
        { dx: 0.1, dy: 0.4, r: 0.2 }
      ]
    });
  }

  function explode(x, y) {
    for (var i = 0; i < 42; i++) {
      var a = Math.random() * Math.PI * 2;
      var s = 60 + Math.random() * 260;
      particles.push({
        x: x, y: y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0.6 + Math.random() * 0.7, age: 0,
        r: 2 + Math.random() * 4,
        color: ['#ffb347', '#ff7847', '#fff3b0', '#c41c83'][i % 4]
      });
    }
  }

  function update(dt) {
    elapsed += dt;
    spawnTimer -= dt;
    var interval = Math.max(0.12, 0.55 - elapsed * 0.008);
    if (spawnTimer <= 0) {
      spawnMeteor();
      spawnTimer = interval;
    }

    // Rocket movement: keys accelerate, pointer steers, gentle damping.
    var ax = 0, ay = 0;
    if (keys['arrowleft'] || keys['a']) ax -= 1;
    if (keys['arrowright'] || keys['d']) ax += 1;
    if (keys['arrowup'] || keys['w']) ay -= 1;
    if (keys['arrowdown'] || keys['s']) ay += 1;
    var SPEED = 1500;
    rocket.vx += ax * SPEED * dt;
    rocket.vy += ay * SPEED * dt;
    if (pointer) {
      var dx = pointer.x - rocket.x, dy = pointer.y - rocket.y;
      var d = Math.hypot(dx, dy);
      if (d > 8) {
        rocket.vx += (dx / d) * SPEED * 0.9 * dt;
        rocket.vy += (dy / d) * SPEED * 0.9 * dt;
      }
    }
    rocket.vx *= Math.pow(0.12, dt);
    rocket.vy *= Math.pow(0.12, dt);
    rocket.x += rocket.vx * dt;
    rocket.y += rocket.vy * dt;
    rocket.x = Math.max(rocket.r, Math.min(W - rocket.r, rocket.x));
    rocket.y = Math.max(rocket.r, Math.min(H - rocket.r, rocket.y));

    // Exhaust particles.
    if (Math.random() < 0.85) {
      particles.push({
        x: rocket.x + (Math.random() - 0.5) * 8,
        y: rocket.y + rocket.r,
        vx: (Math.random() - 0.5) * 40,
        vy: 120 + Math.random() * 80,
        life: 0.35, age: 0, r: 2 + Math.random() * 3,
        color: Math.random() < 0.5 ? '#ffb347' : '#ff7847'
      });
    }

    for (var i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i];
      m.y += m.vy * dt;
      m.x += m.vx * dt;
      m.rot += m.vr * dt;
      if (m.y - m.r > H + 40) {
        meteors.splice(i, 1);
        continue;
      }
      var dist = Math.hypot(m.x - rocket.x, m.y - rocket.y);
      if (dist < m.r + rocket.r * 0.72) {
        explode(rocket.x, rocket.y);
        state = 'over';
        finalScoreEl.textContent = elapsed.toFixed(1);
        gameoverEl.classList.remove('hidden');
        return;
      }
    }

    for (var j = particles.length - 1; j >= 0; j--) {
      var p = particles[j];
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.age >= p.life) particles.splice(j, 1);
    }

    scoreEl.textContent = elapsed.toFixed(1) + 's';
  }

  function drawStarfield(t) {
    ctx.fillStyle = '#0b1026';
    ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.001 + s.tw));
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawRocket() {
    ctx.save();
    ctx.translate(rocket.x, rocket.y);
    // Flame
    var flame = 16 + Math.random() * 14;
    ctx.fillStyle = '#ff7847';
    ctx.beginPath();
    ctx.moveTo(-8, 12);
    ctx.lineTo(0, 12 + flame);
    ctx.lineTo(8, 12);
    ctx.closePath();
    ctx.fill();
    // Body
    ctx.fillStyle = '#f5f7fa';
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.quadraticCurveTo(12, -6, 12, 8);
    ctx.lineTo(-12, 8);
    ctx.quadraticCurveTo(-12, -6, 0, -20);
    ctx.fill();
    // Window
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.arc(0, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    // Fins
    ctx.fillStyle = '#c41c83';
    ctx.beginPath();
    ctx.moveTo(-12, 4);
    ctx.lineTo(-20, 16);
    ctx.lineTo(-12, 14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, 4);
    ctx.lineTo(20, 16);
    ctx.lineTo(12, 14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawMeteor(m) {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.rot);
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.arc(0, 0, m.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6d4c41';
    for (var i = 0; i < m.craters.length; i++) {
      var c = m.craters[i];
      ctx.beginPath();
      ctx.arc(c.dx * m.r, c.dy * m.r, c.r * m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function draw(t) {
    drawStarfield(t);
    for (var i = 0; i < meteors.length; i++) drawMeteor(meteors[i]);
    for (var j = 0; j < particles.length; j++) {
      var p = particles[j];
      ctx.globalAlpha = 1 - p.age / p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (state !== 'over') drawRocket();
  }

  function frame(t) {
    var now = performance.now();
    var dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    if (state === 'playing') update(dt);
    draw(now);
    requestAnimationFrame(frame);
  }

  // Read-only debug hook for automated play-testing (does not change play).
  window.__meteorDodge = {
    get state() { return state; },
    get rocket() { return { x: rocket.x, y: rocket.y, r: rocket.r }; },
    get meteors() { return meteors.map(function (m) { return { x: m.x, y: m.y, r: m.r, vy: m.vy }; }); },
    get elapsed() { return elapsed; }
  };

  reset();
  requestAnimationFrame(frame);
})();
