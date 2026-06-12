/**
 * 生日电子贺卡 · 交互脚本
 * =============================================
 * 【可替换内容】CONFIG.blessingText
 * 【烟花参数】下方 FIREWORK_* 常量，集中调整颜色/数量/速度/大小/持续时间
 * 【全局点击烟花】initGlobalFireworks() + burstFirework(x, y)
 */

/* ========== 可替换配置区域 ========== */
const CONFIG = {
  blessingText:
    '今天是一个特别的日子，因为这个世界又多了一个值得被祝福的你。\n\n' +
    '愿你新的18岁，有热爱，有自由，有坚定向前的勇气。\n\n' +
    '愿你所想皆如愿，所行皆坦途，还是最希望你开心。\n\n' +
    '生日快乐，恭喜你又到了新的18岁哦！',
  /** 礼物弹窗图片：支持 .gif 动图 或 .jpg/.png 静态图，换图后请增大 ?v= */
  giftImage: 'assets/gift-cat.jpg?v=1',
  typewriterSpeed: 60,
  starCount: 50,
  particleCount: 12,
  bubbleCount: 6,
  goldDustCount: 18,
};

/* ========== 烟花可调参数（修改这里即可） ========== */
const FIREWORK_COLORS = [
  [255, 183, 197],  // 柔粉
  [255, 218, 120],  // 明亮金
  [240, 180, 200],  // 玫瑰粉
  [180, 200, 255],  // 梦幻蓝
  [255, 200, 150],  // 蜜桃橙
  [200, 230, 200],  // 柔绿
  [255, 160, 160],  // 珊瑚红
  [230, 200, 255],  // 淡紫粉
  [255, 240, 200],  // 奶油金
  [255, 210, 180],  // 暖杏
];

const FIREWORK_PARTICLE_COUNT = 60;
const FIREWORK_GIFT_PARTICLE_COUNT = 88;
const FIREWORK_DURATION = 0.0065;      // 粒子衰减（越小停留越久，当前约 2~3 秒）
const FIREWORK_MIN_SPEED = 1.8;
const FIREWORK_MAX_SPEED = 6.2;
const FIREWORK_PARTICLE_SIZE = 3.4;
const FIREWORK_GRAVITY = 0.026;        // 重力（越小飘越久）
const FIREWORK_FRICTION = 0.982;
const FIREWORK_MAX_ON_SCREEN = 420;
const FIREWORK_GIFT_BURST_COUNT = 4;
const FIREWORK_FLASH_FRAMES = 22;
const FIREWORK_ASCENT_HEIGHT = 65;     // 升空高度（px）
const FIREWORK_ASCENT_SPEED = 4.8;     // 升空速度
const FIREWORK_SECONDARY_DELAY = 380;  // 二次绽放间隔（ms）
const FIREWORK_SPARKLE_DELAY = 720;    // 收尾闪烁间隔（ms）

/* ========== DOM 元素 ========== */
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicIcon = musicToggle ? musicToggle.querySelector('.music-icon') : null;
const musicToast = document.getElementById('musicToast');
const openBtn = document.getElementById('openBtn');
const replayBtn = document.getElementById('replayBtn');
const envelopeLayer = document.getElementById('envelopeLayer');
const envelopeClose = document.getElementById('envelopeClose');
const stepPanels = document.querySelectorAll('.step-panel');
const stepDots = document.querySelectorAll('.step-dot');
const stepPrev = document.getElementById('stepPrev');
const stepNext = document.getElementById('stepNext');
const giftBox = document.getElementById('giftBox');
const modalOverlay = document.getElementById('modalOverlay');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const giftModalImage = document.getElementById('giftModalImage');
const giftModalPlaceholder = document.getElementById('giftModalPlaceholder');
const typewriterText = document.getElementById('typewriterText');
const typewriterCursor = document.getElementById('typewriterCursor');
const starfield = document.getElementById('starfield');
const floatingParticles = document.getElementById('floatingParticles');
const fireworksCanvas = document.getElementById('fireworksCanvas');

/* ========== 状态 ========== */
let isMusicPlaying = false;
let isMusicReady = false;
let musicToastTimer = null;
let typewriterStarted = false;
let typewriterTimer = null;
let currentStep = 0;
const TOTAL_STEPS = 4;
let fireworksAnimating = false;
let sparks = [];
let flashes = [];
let rockets = [];

/* ============================================================
   背景星点与金粉粒子
   ============================================================ */
function initStars() {
  const fragment = document.createDocumentFragment();
  const starColors = [
    'rgba(241, 198, 122, 0.95)',
    'rgba(243, 166, 184, 0.9)',
    'rgba(214, 154, 92, 0.88)',
    'rgba(255, 241, 230, 0.95)',
    'rgba(217, 111, 147, 0.75)',
  ];

  for (let i = 0; i < CONFIG.starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star-dot';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.setProperty('--twinkle-duration', (2.5 + Math.random() * 3.5) + 's');
    star.style.animationDelay = Math.random() * 5 + 's';
    const size = Math.random() > 0.75 ? 3 : 2;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.background = starColors[Math.floor(Math.random() * starColors.length)];
    star.style.boxShadow = '0 0 6px rgba(241, 198, 122, 0.55)';
    fragment.appendChild(star);
  }
  starfield.appendChild(fragment);
}

function initFloatingParticles() {
  const colors = [
    'rgba(241, 198, 122, 0.72)',
    'rgba(243, 166, 184, 0.65)',
    'rgba(214, 154, 92, 0.6)',
    'rgba(255, 230, 210, 0.7)',
    'rgba(217, 111, 147, 0.55)',
  ];

  for (let i = 0; i < CONFIG.particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 2 + Math.random() * 3;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.setProperty('--particle-opacity', (0.45 + Math.random() * 0.35).toString());
    p.style.animationDuration = (12 + Math.random() * 14) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    floatingParticles.appendChild(p);
  }

  for (let i = 0; i < CONFIG.goldDustCount; i++) {
    const d = document.createElement('div');
    d.className = 'particle particle--dust';
    const size = 1.5 + Math.random() * 2;
    d.style.width = size + 'px';
    d.style.height = size + 'px';
    d.style.left = Math.random() * 100 + '%';
    d.style.background = 'rgba(241, 198, 122, 0.75)';
    d.style.setProperty('--particle-opacity', (0.4 + Math.random() * 0.4).toString());
    d.style.animationDuration = (14 + Math.random() * 12) + 's';
    d.style.animationDelay = Math.random() * 12 + 's';
    floatingParticles.appendChild(d);
  }

  for (let i = 0; i < CONFIG.bubbleCount; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = 16 + Math.random() * 32;
    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.left = Math.random() * 100 + '%';
    b.style.top = Math.random() * 100 + '%';
    b.style.setProperty('--bubble-duration', (9 + Math.random() * 7) + 's');
    b.style.animationDelay = Math.random() * 6 + 's';
    floatingParticles.appendChild(b);
  }
}

/* ============================================================
   背景音乐
   ============================================================ */
function updateMusicIcon() {
  if (!musicIcon || !musicToggle) return;
  musicIcon.textContent = isMusicPlaying ? '♪' : '♫';
  musicToggle.classList.toggle('playing', isMusicPlaying);
  musicToggle.classList.toggle('unavailable', !isMusicReady);
}

function showMusicToast(message) {
  if (!musicToast) return;
  musicToast.textContent = message;
  musicToast.removeAttribute('hidden');
  clearTimeout(musicToastTimer);
  musicToastTimer = setTimeout(() => musicToast.setAttribute('hidden', ''), 2800);
}

function markMusicReady() {
  isMusicReady = true;
  if (musicToggle) musicToggle.classList.remove('loading');
  updateMusicIcon();
}

function markMusicUnavailable(message) {
  isMusicReady = false;
  isMusicPlaying = false;
  if (musicToggle) musicToggle.classList.remove('loading');
  updateMusicIcon();
  console.info('[生日贺卡]', message);
}

/** 等待音频可播放（手机端大文件需用户点击后才开始加载） */
function waitForMusicCanPlay(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (bgMusic.readyState >= 2 && !bgMusic.error) {
      resolve();
      return;
    }
    if (bgMusic.error) {
      reject(new Error('music load error'));
      return;
    }

    let settled = false;
    const done = (fn) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      bgMusic.removeEventListener('canplay', onCanPlay);
      bgMusic.removeEventListener('loadeddata', onCanPlay);
      bgMusic.removeEventListener('error', onError);
      fn();
    };

    const onCanPlay = () => done(resolve);
    const onError = () => done(() => reject(new Error('music load error')));
    const timer = setTimeout(() => done(() => reject(new Error('music load timeout'))), timeoutMs);

    bgMusic.addEventListener('canplay', onCanPlay);
    bgMusic.addEventListener('loadeddata', onCanPlay);
    bgMusic.addEventListener('error', onError);
    bgMusic.load();
  });
}

async function playMusic() {
  if (!bgMusic) return false;
  if (musicToggle) musicToggle.classList.add('loading');

  try {
    bgMusic.volume = 0.85;

    // 不在此处拦截 isMusicReady：手机端 14MB 音乐预载慢，点击时应主动加载并播放
    if (bgMusic.readyState < 2) {
      await waitForMusicCanPlay();
    }

    await bgMusic.play();
    isMusicPlaying = true;
    isMusicReady = true;
    if (musicToggle) musicToggle.classList.remove('loading');
    updateMusicIcon();
    return true;
  } catch (err) {
    if (musicToggle) musicToggle.classList.remove('loading');
    isMusicPlaying = false;
    updateMusicIcon();

    if (bgMusic.error || err.message === 'music load error') {
      showMusicToast('音乐文件加载失败，请检查网络后重试');
      console.info('[生日贺卡] 音乐文件错误码：', bgMusic.error?.code);
    } else if (err.message === 'music load timeout') {
      showMusicToast('音乐文件较大，加载较慢，请稍后再点一次');
    } else {
      showMusicToast('音乐暂时无法播放，请再点一次或检查手机是否静音');
    }
    console.info('[生日贺卡] 音乐播放失败：', err.message);
    return false;
  }
}

function pauseMusic() {
  if (!bgMusic) return;
  bgMusic.pause();
  isMusicPlaying = false;
  updateMusicIcon();
}

function toggleMusic() {
  isMusicPlaying ? pauseMusic() : playMusic();
}

function initMusic() {
  if (!bgMusic || !musicToggle) return;
  musicToggle.addEventListener('click', toggleMusic);

  const onReady = () => {
    if (bgMusic.readyState >= 2) markMusicReady();
  };

  bgMusic.addEventListener('loadeddata', onReady);
  bgMusic.addEventListener('canplay', onReady);
  bgMusic.addEventListener('error', () => {
    markMusicUnavailable('音乐文件加载失败');
    // 仅控制台提示，避免一进页面就弹窗吓到用户
    console.info('[生日贺卡] 音乐文件加载失败，请确认 assets/music.mp3 已部署');
  });

  // 预载元数据即可，完整音频在用户点击时再加载（更适合手机端）
  bgMusic.load();
  if (bgMusic.readyState >= 2) markMusicReady();
  else updateMusicIcon();
}

/* ============================================================
   信封打开 / 分步浏览
   【核心】openEnvelope() / closeEnvelope() / goToStep()
   ============================================================ */
function openEnvelope() {
  if (!envelopeLayer) return;

  envelopeLayer.removeAttribute('hidden');
  envelopeLayer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('envelope-open');
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    envelopeLayer.classList.add('envelope-layer--visible');
    setTimeout(() => envelopeLayer.classList.add('envelope-layer--open'), 60);
  });

  document.querySelectorAll('.photo-card').forEach((c) => c.classList.remove('visible'));
  currentStep = 0;
  goToStep(0, false);
  playMusic();
}

function closeEnvelope() {
  if (!envelopeLayer) return;

  envelopeLayer.classList.remove('envelope-layer--open');
  setTimeout(() => {
    envelopeLayer.classList.remove('envelope-layer--visible');
    envelopeLayer.setAttribute('hidden', '');
    envelopeLayer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('envelope-open');
    if (!modalOverlay.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  }, 480);
}

function goToStep(index, animate) {
  if (animate === undefined) animate = true;
  currentStep = Math.max(0, Math.min(TOTAL_STEPS - 1, index));

  stepPanels.forEach((panel, i) => {
    const isActive = i === currentStep;
    panel.classList.toggle('step-panel--active', isActive);
    if (!isActive) panel.classList.remove('step-panel--active');
  });

  stepDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentStep);
  });

  if (stepPrev) stepPrev.disabled = currentStep === 0;
  if (stepNext) {
    stepNext.textContent = currentStep === TOTAL_STEPS - 1 ? '完成 ✨' : '下一页';
  }

  onStepEnter(currentStep);
}

function onStepEnter(step) {
  if (step === 0) {
    document.querySelectorAll('.photo-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 80);
    });
  }
  if (step === 1 && !typewriterStarted) {
    typewriterStarted = true;
    startTypewriter();
  }
}

function resetCardExperience() {
  clearTimeout(typewriterTimer);
  typewriterStarted = false;
  if (typewriterText) typewriterText.textContent = '';
  if (typewriterCursor) typewriterCursor.classList.remove('hidden');
  document.querySelectorAll('.photo-card').forEach((c) => c.classList.remove('visible'));
  currentStep = 0;
}

function initEnvelope() {
  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
  }

  if (envelopeClose) {
    envelopeClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeEnvelope();
    });
  }

  if (stepPrev) {
    stepPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentStep > 0) goToStep(currentStep - 1);
    });
  }

  if (stepNext) {
    stepNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentStep < TOTAL_STEPS - 1) {
        goToStep(currentStep + 1);
      } else {
        closeEnvelope();
      }
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetCardExperience();
      closeEnvelope();
    });
  }
}

/* ============================================================
   图片 / 打字机
   ============================================================ */

function initPhotoFallbacks() {
  document.querySelectorAll('.photo-frame img').forEach((img) => {
    const onLoad = () => { img.classList.add('loaded'); img.classList.remove('error'); };
    const onError = () => {
      img.classList.add('error');
      img.classList.remove('loaded');
      console.info('[生日贺卡] 图片加载失败：', img.getAttribute('src'));
    };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    if (img.complete) (img.naturalWidth > 0 ? onLoad() : onError());
  });
}

function startTypewriter() {
  const chars = [...CONFIG.blessingText];
  let index = 0;
  typewriterText.textContent = '';
  typewriterCursor.classList.remove('hidden');

  function typeNext() {
    if (index < chars.length) {
      typewriterText.textContent += chars[index];
      index++;
      const delay = chars[index - 1] === '\n' ? CONFIG.typewriterSpeed * 3 : CONFIG.typewriterSpeed;
      typewriterTimer = setTimeout(typeNext, delay);
    } else {
      typewriterTimer = setTimeout(() => typewriterCursor.classList.add('hidden'), 2000);
    }
  }
  typeNext();
}

/* ============================================================
   礼物盒与弹窗
   ============================================================ */
function initGiftModalImage() {
  if (!giftModalImage) return;

  giftModalImage.src = CONFIG.giftImage;

  const onLoad = () => {
    giftModalImage.classList.add('loaded');
    giftModalImage.classList.remove('error');
    if (giftModalPlaceholder) giftModalPlaceholder.hidden = true;
  };

  const onError = () => {
    giftModalImage.classList.add('error');
    giftModalImage.classList.remove('loaded');
    if (giftModalPlaceholder) giftModalPlaceholder.hidden = false;
    console.info('[生日贺卡] 礼物图片加载失败，请检查：', CONFIG.giftImage);
  };

  giftModalImage.addEventListener('load', onLoad);
  giftModalImage.addEventListener('error', onError);
  if (giftModalImage.complete) {
    giftModalImage.naturalWidth > 0 ? onLoad() : onError();
  }
}

function openModal() {
  modalOverlay.removeAttribute('hidden');
  requestAnimationFrame(() => modalOverlay.classList.add('active'));
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('active');
  if (!document.body.classList.contains('envelope-open')) {
    document.body.style.overflow = '';
  }
  setTimeout(() => modalOverlay.setAttribute('hidden', ''), 450);
}

if (giftBox) {
  giftBox.addEventListener('click', (e) => {
    e.stopPropagation();
    giftBox.classList.remove('bounce');
    void giftBox.offsetWidth;
    giftBox.classList.add('bounce');
    const rect = giftBox.getBoundingClientRect();
    launchFirework(rect.left + rect.width / 2, rect.top + rect.height / 2, true);
    openModal();
  });
}

modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

/* ============================================================
   烟花系统（Canvas）
   【核心】burstFirework(x, y, isGiftBurst) — 点击位置绽放
   【核心】initGlobalFireworks() — 全局点击监听
   ============================================================ */
const fireworksCtx = fireworksCanvas.getContext('2d');

function resizeCanvas() {
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function pickColor() {
  return FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
}

/** 升空阶段：点击后先向上飞一小段再绽放 */
class AscentRocket {
  constructor(x, y, onReach) {
    this.x = x;
    this.y = y;
    this.startY = y;
    this.targetY = y - FIREWORK_ASCENT_HEIGHT;
    this.vy = -FIREWORK_ASCENT_SPEED;
    this.color = pickColor();
    this.trail = [];
    this.onReach = onReach;
  }

  update() {
    this.trail.push({ x: this.x, y: this.y, life: 1 });
    if (this.trail.length > 12) this.trail.shift();
    this.trail.forEach((t) => { t.life -= 0.12; });

    this.y += this.vy;
    this.vy *= 0.96;

    if (this.y <= this.targetY) {
      this.onReach(this.x, this.y);
      return false;
    }
    return true;
  }

  draw(ctx) {
    const [r, g, b] = this.color;
    this.trail.forEach((t) => {
      if (t.life <= 0) return;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 2 * t.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${t.life * 0.5})`;
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
    ctx.fill();
  }
}

/** 烟花粒子：带拖尾、随机大小与速度 */
class FireworkParticle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;

    const angle = options.angle ?? Math.random() * Math.PI * 2;
    const speedMul = options.speedMul ?? 1;
    const speed = (FIREWORK_MIN_SPEED + Math.random() * (FIREWORK_MAX_SPEED - FIREWORK_MIN_SPEED)) * speedMul;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.life = 1;
    this.decay = FIREWORK_DURATION * (0.55 + Math.random() * 0.5);
    this.size = (FIREWORK_PARTICLE_SIZE * (0.5 + Math.random() * 0.9)) * (options.sizeMul ?? 1);
    this.color = options.color || pickColor();
    this.hasTrail = options.trail !== false && Math.random() > 0.3;
    this.gravity = FIREWORK_GRAVITY + Math.random() * 0.012;
    this.friction = FIREWORK_FRICTION + Math.random() * 0.008;
    this.fadeDelay = options.fadeDelay ?? 0; // 延迟开始衰减
  }

  update() {
    this.prevX = this.x;
    this.prevY = this.y;
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= this.friction;
    if (this.fadeDelay > 0) {
      this.fadeDelay--;
    } else {
      this.life -= this.decay;
    }
  }

  draw(ctx) {
    if (this.life <= 0) return;
    const [r, g, b] = this.color;
    const a = this.life * 0.82;

    if (this.hasTrail) {
      ctx.beginPath();
      ctx.moveTo(this.prevX, this.prevY);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.35})`;
      ctx.lineWidth = Math.max(0.5, this.size * 0.45 * this.life);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.12})`;
    ctx.fill();
  }
}

/** 中心闪光 */
class BurstFlash {
  constructor(x, y, intensity) {
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.maxLife = FIREWORK_FLASH_FRAMES;
    this.intensity = intensity || 1;
  }

  update() { this.frame++; }

  get life() { return 1 - this.frame / this.maxLife; }

  draw(ctx) {
    if (this.life <= 0) return;
    const radius = (1 - this.life) * 22 * this.intensity + 5;
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
    grad.addColorStop(0, `rgba(255, 255, 255, ${this.life * 0.65 * this.intensity})`);
    grad.addColorStop(0.35, `rgba(255, 220, 180, ${this.life * 0.3 * this.intensity})`);
    grad.addColorStop(1, 'rgba(255, 200, 180, 0)');
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

/** 在坐标处绽放粒子（主绽放 / 二次绽放 / 收尾闪烁） */
function spawnBurst(x, y, options = {}) {
  const {
    count = FIREWORK_PARTICLE_COUNT,
    intensity = 1,
    speedMul = 1,
    sizeMul = 1,
    fadeDelay = 0,
    ring = false,
  } = options;

  if (sparks.length >= FIREWORK_MAX_ON_SCREEN) {
    sparks.splice(0, Math.floor(count * 0.5));
  }

  flashes.push(new BurstFlash(x, y, intensity));

  for (let i = 0; i < count; i++) {
    const angle = ring
      ? (Math.PI * 2 * i) / count + Math.random() * 0.15
      : undefined;
    sparks.push(new FireworkParticle(x, y, {
      angle,
      speedMul: speedMul * (ring ? 0.9 : 0.7 + Math.random() * 0.5),
      sizeMul,
      fadeDelay,
      trail: true,
    }));
  }

  startFireworkLoop();
}

/** 完整烟花流程：主爆 → 二次绽放 → 收尾闪烁 */
function burstFirework(x, y, isGiftBurst) {
  const mainCount = isGiftBurst ? FIREWORK_GIFT_PARTICLE_COUNT : FIREWORK_PARTICLE_COUNT;

  /* 第一阶段：主绽放 */
  spawnBurst(x, y, {
    count: Math.floor(mainCount * 0.5),
    intensity: isGiftBurst ? 1.5 : 1.2,
    speedMul: 1.1,
    sizeMul: 0.85,
  });
  spawnBurst(x, y, {
    count: Math.ceil(mainCount * 0.5),
    intensity: isGiftBurst ? 1.3 : 1,
    speedMul: 0.72,
    sizeMul: 1.2,
    fadeDelay: 8,
  });

  /* 第二阶段：延迟二次环状绽放 */
  setTimeout(() => {
    spawnBurst(x, y, {
      count: Math.floor(mainCount * 0.45),
      intensity: 0.85,
      speedMul: 0.55,
      sizeMul: 0.7,
      fadeDelay: 5,
      ring: true,
    });
  }, FIREWORK_SECONDARY_DELAY);

  /* 第三阶段：收尾闪烁粒子（缓慢下落） */
  setTimeout(() => {
    const sparkleCount = Math.floor(mainCount * 0.35);
    for (let i = 0; i < sparkleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 40;
      const sx = x + Math.cos(angle) * dist;
      const sy = y + Math.sin(angle) * dist;
      sparks.push(new FireworkParticle(sx, sy, {
        speedMul: 0.35,
        sizeMul: 0.55,
        fadeDelay: 12 + Math.floor(Math.random() * 10),
        trail: Math.random() > 0.6,
      }));
    }
    flashes.push(new BurstFlash(x, y, 0.6));
    startFireworkLoop();
  }, FIREWORK_SPARKLE_DELAY);

  /* 礼物盒：额外连发 */
  if (isGiftBurst) {
    for (let b = 1; b < FIREWORK_GIFT_BURST_COUNT; b++) {
      setTimeout(() => {
        const ox = x + (Math.random() - 0.5) * 70;
        const oy = y + (Math.random() - 0.5) * 55;
        burstFirework(ox, oy, false);
      }, b * 420);
    }
  }
}

/** 启动完整烟花（含升空阶段） */
function launchFirework(x, y, isGiftBurst) {
  if (isGiftBurst) {
    burstFirework(x, y, true);
    return;
  }

  rockets.push(new AscentRocket(x, y, (bx, by) => {
    burstFirework(bx, by, false);
  }));
  startFireworkLoop();
}

function startFireworkLoop() {
  if (!fireworksAnimating) {
    fireworksAnimating = true;
    animateFireworks();
  }
}

function animateFireworks() {
  fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

  rockets = rockets.filter((r) => {
    const alive = r.update();
    if (alive) r.draw(fireworksCtx);
    return alive;
  });

  flashes = flashes.filter((f) => f.life > 0);
  flashes.forEach((f) => { f.update(); f.draw(fireworksCtx); });

  sparks = sparks.filter((s) => s.life > 0);
  sparks.forEach((s) => { s.update(); s.draw(fireworksCtx); });

  if (rockets.length > 0 || sparks.length > 0 || flashes.length > 0) {
    requestAnimationFrame(animateFireworks);
  } else {
    fireworksAnimating = false;
    fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  }
}

/** 全局点击任意位置触发烟花 */
function initGlobalFireworks() {
  let lastBurst = 0;

  document.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastBurst < 260) return;
    lastBurst = now;
    launchFirework(e.clientX, e.clientY, false);
  });
}

/* ============================================================
   初始化
   ============================================================ */
function init() {
  initStars();
  initFloatingParticles();
  initPhotoFallbacks();
  initGiftModalImage();
  initEnvelope();
  initMusic();
  initGlobalFireworks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
