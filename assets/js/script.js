
'use strict';
/* ══════════════════════════════════════════════════════
   MÓDULO: URLParams — lee nombre del invitado de la URL
   ?fname=Daniel&Lname=Jimenez&boletos=4%20boletos
══════════════════════════════════════════════════════ */
/* Invitación general — sin personalización por invitado */

/* ══════════════════════════════════════════════════════
   MÓDULO: EnvelopeOpener
══════════════════════════════════════════════════════ */
const EnvelopeOpener=(() => {
  const open=()=>{
    const env   = document.getElementById('envelope');
    const cover = document.getElementById('cover');
    const main  = document.getElementById('main');
    const ap    = document.getElementById('ap');
    if(!env || env.classList.contains('opened')) return;
    env.classList.add('opened');
    setTimeout(()=>{
      cover.classList.add('hidden');
      main.classList.add('visible');
      ap.classList.add('visible');
    }, 1500);
  };
  const init=()=>{
    document.getElementById('env-wrap')?.addEventListener('click', open);
    document.getElementById('cover')?.addEventListener('keydown', e=>{
      if(e.key==='Enter'||e.key===' ') open();
    });
  };
  return{init};
})();

/* ══════════════════════════════════════════════════════
   MÓDULO: PetalEngine — Rosas azules cayendo
   ─────────────────────────────────────────────────────
   🎛️ CONFIGURACIÓN FÁCIL:
     COUNT      → cantidad de pétalos en pantalla (menos = más suave)
                  Recomendado: 15–20 sutil | 30–40 moderado | 50+ abundante
     SPEED_MIN  → velocidad mínima de caída (píxeles por frame)
     SPEED_MAX  → velocidad máxima de caída
     SIZE_MIN   → tamaño mínimo del pétalo (px)
     SIZE_MAX   → tamaño máximo del pétalo (px)
     OPACITY    → transparencia max (0.0–1.0). Menor = más tenue
     SWAY       → cuánto se balancea horizontalmente (0 = recto)
══════════════════════════════════════════════════════ */
const PetalEngine=(() => {
  const canvas=document.getElementById('petals-canvas');
  const ctx=canvas.getContext('2d');
  const petals=[];

  /* ── AJUSTA ESTOS VALORES A TU GUSTO ─────────────── */
  const COUNT     = 22;   // cantidad de pétalos
  const SPEED_MIN = 0.35; // caída lenta
  const SPEED_MAX = 0.85; // caída rápida
  const SIZE_MIN  = 6;    // tamaño mínimo
  const SIZE_MAX  = 16;   // tamaño máximo
  const OPACITY   = 0.55; // transparencia máxima (0–1)
  const SWAY      = 0.6;  // balanceo lateral
  /* ────────────────────────────────────────────────── */

  const resize=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight};

  const rand=(a,b)=>a+Math.random()*(b-a);

  /* Dibuja un pétalo de rosa con forma de corazón invertido (curva bezier) */
  const drawRosePetal=(ctx, size)=>{
    const w=size, h=size*1.4;
    ctx.beginPath();
    // Pétalo con forma orgánica usando bezier curves
    ctx.moveTo(0, h*0.3);
    ctx.bezierCurveTo(-w*0.6, -h*0.1,  -w*0.9, -h*0.5,  0, -h*0.55);
    ctx.bezierCurveTo( w*0.9, -h*0.5,   w*0.6, -h*0.1,  0,  h*0.3);
    ctx.closePath();
  };

  class Petal{
    constructor(initRandom=false){this.reset(initRandom)}
    reset(initRandom=false){
      this.x    = rand(0, canvas.width);
      this.y    = initRandom ? rand(-50, canvas.height) : rand(-60,-10);
      this.size = rand(SIZE_MIN, SIZE_MAX);
      this.vy   = rand(SPEED_MIN, SPEED_MAX);
      this.vx   = 0;
      this.swayAngle  = rand(0, Math.PI*2);
      this.swaySpeed  = rand(0.008, 0.022);
      this.rotation   = rand(0, Math.PI*2);
      this.rotSpeed   = (Math.random()-.5)*0.025;
      this.opacity    = rand(OPACITY*0.4, OPACITY);
      // Rosa azul: tono entre azul violáceo (220°) y azul real (240°)
      this.hue        = rand(215, 245);
      this.saturation = rand(55, 80);
      this.lightness  = rand(60, 78);
    }
    update(){
      this.swayAngle += this.swaySpeed;
      this.vx = Math.sin(this.swayAngle) * SWAY;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;
      if(this.y > canvas.height + 30) this.reset();
    }
    draw(){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      // Relleno principal del pétalo
      const grad = ctx.createRadialGradient(0,-this.size*.2,0, 0,0,this.size);
      grad.addColorStop(0, `hsl(${this.hue},${this.saturation}%,${this.lightness+12}%)`);
      grad.addColorStop(1, `hsl(${this.hue},${this.saturation}%,${this.lightness-8}%)`);
      ctx.fillStyle = grad;

      drawRosePetal(ctx, this.size);
      ctx.fill();

      // Vena central sutil
      ctx.strokeStyle = `hsla(${this.hue},${this.saturation}%,${this.lightness-20}%,0.25)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, this.size*.28);
      ctx.lineTo(0, -this.size*.48);
      ctx.stroke();

      ctx.restore();
    }
  }

  const animate=()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    petals.forEach(p=>{p.update();p.draw()});
    requestAnimationFrame(animate);
  };

  const init=()=>{
    resize();
    window.addEventListener('resize',resize);
    for(let i=0;i<COUNT;i++) petals.push(new Petal(true));
    animate();
  };
  return{init};
})();

/* ══════════════════════════════════════════════════════
   MÓDULO: CountdownTimer
══════════════════════════════════════════════════════ */
const CountdownTimer=(() => {
  const TARGET=new Date('2026-07-11T13:30:00');
  const pad=n=>String(n).padStart(2,'0');
  const diff=()=>{
    const ms=TARGET-Date.now();
    if(ms<=0) return null;
    const s=Math.floor(ms/1000);
    return{days:Math.floor(s/86400),hours:Math.floor((s%86400)/3600),minutes:Math.floor((s%3600)/60),seconds:s%60};
  };
  const update=({days,hours,minutes,seconds})=>{
    document.getElementById('cd-d').textContent=pad(days);
    document.getElementById('cd-h').textContent=pad(hours);
    document.getElementById('cd-m').textContent=pad(minutes);
    document.getElementById('cd-s').textContent=pad(seconds);
  };
  const expired=()=>{
    const el=document.getElementById('countdown');
    if(el) el.innerHTML=`<p style="font-family:var(--font-script);font-size:clamp(2rem,6vw,4rem);color:var(--gold-lt)">¡Hoy es el día! 🎉</p>`;
  };
  const tick=()=>{const d=diff();if(!d){expired();return}update(d)};
  const init=()=>{tick();setInterval(tick,1000)};
  return{init};
})();

/* ══════════════════════════════════════════════════════
   MÓDULO: QuotesCarousel
══════════════════════════════════════════════════════ */
const QuotesCarousel=(() => {
  let cur=0;let timer=null;
  const INTERVAL=5500;
  const slides=()=>Array.from(document.querySelectorAll('.qslide'));
  const dots=()=>Array.from(document.querySelectorAll('.qc-dot'));
  const goTo=idx=>{
    const sl=slides(),dt=dots();
    sl[cur].classList.remove('on');dt[cur]?.classList.remove('on');
    cur=(idx+sl.length)%sl.length;
    sl[cur].classList.add('on');dt[cur]?.classList.add('on');
  };
  const buildDots=()=>{
    const wrap=document.getElementById('qc-dots');
    slides().forEach((_,i)=>{
      const d=document.createElement('button');
      d.className='qc-dot'+(i===0?' on':'');
      d.setAttribute('aria-label',`Frase ${i+1}`);
      d.addEventListener('click',()=>{goTo(i);reset()});
      wrap.appendChild(d);
    });
  };
  const reset=()=>{clearInterval(timer);timer=setInterval(()=>goTo(cur+1),INTERVAL)};
  const init=()=>{
    buildDots();
    document.getElementById('qc-prev')?.addEventListener('click',()=>{goTo(cur-1);reset()});
    document.getElementById('qc-next')?.addEventListener('click',()=>{goTo(cur+1);reset()});
    reset();
  };
  return{init};
})();

/* ══════════════════════════════════════════════════════
   MÓDULO: ScrollReveal
══════════════════════════════════════════════════════ */
const ScrollReveal=(() => {
  const SELS=['.rev','.tl-item'];
  const getEls=()=>SELS.flatMap(s=>Array.from(document.querySelectorAll(s)));
  const init=()=>{
    const els=getEls();
    if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('vis'));return}
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');io.unobserve(e.target)}})
    },{threshold:.1});
    els.forEach(e=>io.observe(e));
  };
  return{init};
})();

/* ══════════════════════════════════════════════════════
   MÓDULO: AudioPlayer
══════════════════════════════════════════════════════ */
const AudioPlayer=(() => {
  let playing=false;
  let actx=null,gain=null,osc=null;
  const audioEl=document.getElementById('bg-audio');
  const btn=document.getElementById('ap-btn');
  const playIcon=document.getElementById('ap-play');
  const pauseIcon=document.getElementById('ap-pause');
  const bars=document.getElementById('ap-bars');
  const hasRealAudio=()=>audioEl?.querySelector('source');
  const initWA=()=>{
    actx=new(window.AudioContext||window.webkitAudioContext)();
    gain=actx.createGain();gain.gain.value=.05;gain.connect(actx.destination);
  };
  const startTone=()=>{
    if(!actx) initWA();
    osc=actx.createOscillator();osc.type='sine';osc.frequency.value=294;
    osc.connect(gain);osc.start();
  };
  const stopTone=()=>{try{osc?.stop()}catch(e){}osc=null};
  const setUI=p=>{
    playIcon.style.display=p?'none':'block';
    pauseIcon.style.display=p?'block':'none';
    bars.classList.toggle('off',!p);
    btn.setAttribute('aria-pressed',String(p));
  };
  const toggle=()=>{
    if(!playing){
      hasRealAudio()?audioEl.play().catch(()=>{}):startTone();
      playing=true;
    }else{
      hasRealAudio()?audioEl.pause():stopTone();
      playing=false;
    }
    setUI(playing);
  };
  const init=()=>btn?.addEventListener('click',toggle);
  return{init};
})();

/* ══════════════════════════════════════════════════════
   APP — orquestador
══════════════════════════════════════════════════════ */
const App=(() => {
  const init=()=>{
    EnvelopeOpener.init();
    PetalEngine.init();
    CountdownTimer.init();
    QuotesCarousel.init();
    ScrollReveal.init();
    AudioPlayer.init();
  };
  return{init};
})();

document.readyState==='loading'
  ?document.addEventListener('DOMContentLoaded',App.init)
  :App.init();
