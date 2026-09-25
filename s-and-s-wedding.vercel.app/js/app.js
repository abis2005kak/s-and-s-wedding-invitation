const opening = document.getElementById('opening');
const openingVideo = document.getElementById('openingVideo');
const sealButton = document.getElementById('sealButton');
const tapText = document.getElementById('tapText');
const invitation = document.getElementById('invitation');
const bgm = document.getElementById('bgm');
const floatingDecor = document.querySelector('.floating-decor');
const musicToggle = document.getElementById('musicToggle');
const musicLabel = document.getElementById('musicLabel');

let musicOn = true;

function updateMusicControl(){
  if(!musicToggle) return;
  musicToggle.classList.toggle('off', !musicOn);
  musicToggle.setAttribute('aria-pressed', String(musicOn));
  musicToggle.setAttribute('aria-label', musicOn ? 'Turn music off' : 'Turn music on');
  if(musicLabel) musicLabel.textContent = musicOn ? 'Music On' : 'Music Off';
}

musicToggle?.addEventListener('click', async () => {
  if(musicOn){
    bgm.pause();
    musicOn = false;
  }else{
    musicOn = true;
    try { await bgm.play(); } catch(e) { musicOn = false; }
  }
  updateMusicControl();
});
updateMusicControl();

function enterInvitation(){
  opening.classList.add('hide');
  invitation.classList.add('show');
  invitation.setAttribute('aria-hidden','false');
  floatingDecor.classList.add('active');
  if(musicToggle) musicToggle.classList.add('visible');
  window.scrollTo({top:0,behavior:'instant'});
}

sealButton.addEventListener('click', () => {
  sealButton.disabled = true;
  tapText.style.opacity = '0';

  // Start the full background track directly from the wax-seal user gesture.
  // Calling play() synchronously here keeps browser autoplay policies satisfied.
  try {
    bgm.loop = true;
    bgm.currentTime = 0;
    bgm.volume = 0.55;
    if(musicOn) bgm.play().catch(() => {});
  } catch(e) {}

  openingVideo.currentTime = 0;
  try { openingVideo.play().catch(() => {}); } catch(e) {}
});
openingVideo.addEventListener('ended', enterInvitation);

// One-swipe scratch reveal. A tap alone never reveals a card.
const revealCards = document.querySelectorAll('[data-reveal]');
revealCards.forEach(card => {
  let startX = 0, startY = 0, moved = false, active = false;
  const threshold = 34;
  card.addEventListener('pointerdown', e => {
    if(card.classList.contains('revealed')) return;
    active = true; moved = false; startX = e.clientX; startY = e.clientY;
    card.setPointerCapture(e.pointerId);
  });
  card.addEventListener('pointermove', e => {
    if(!active || card.classList.contains('revealed')) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if(Math.hypot(dx,dy) >= threshold) moved = true;
  });
  const finish = e => {
    if(!active) return;
    active = false;
    if(moved && !card.classList.contains('revealed')) card.classList.add('revealed');
    try { card.releasePointerCapture(e.pointerId); } catch(err) {}
  };
  card.addEventListener('pointerup', finish);
  card.addEventListener('pointercancel', finish);
});

const burst = document.getElementById('celebrationBurst');
let burstShown = false;
function celebrateDateReveal(){
  if(burstShown || !burst) return;
  burstShown = true;
  burst.classList.add('show');
  const pieces = ['✦','✧','•','❋','✺','▪','✹','✷','✸','❈','✼','✧','○','●','◦','·','✦'];
  for(let i=0;i<180;i++){
    const piece = document.createElement('span');
    piece.className = 'burst-piece';
    piece.textContent = pieces[Math.floor(Math.random()*pieces.length)];
    piece.style.left = `${50 + (Math.random()*10-5)}%`;
    piece.style.top = `${36 + (Math.random()*8-4)}%`;
    piece.style.setProperty('--x', `${(Math.random()*2-1)*58}vw`);
    piece.style.setProperty('--y', `${32 + Math.random()*72}vh`);
    piece.style.setProperty('--r', `${Math.random()*720-360}deg`);
    piece.style.setProperty('--d', `${2.2 + Math.random()*2.8}s`);
    piece.style.setProperty('--delay', `${Math.random()*.75}s`);
    burst.appendChild(piece);
  }
  setTimeout(() => burst.classList.remove('show'), 4300);
  setTimeout(() => { burst.innerHTML=''; }, 4800);
}

revealCards.forEach(card => {
  const observer = new MutationObserver(() => {
    const count = document.querySelectorAll('[data-reveal].revealed').length;
    if(count === 3) setTimeout(celebrateDateReveal, 260);
  });
  observer.observe(card,{attributes:true,attributeFilter:['class']});
});

const weddingDate = new Date('2026-10-30T06:00:00+05:30').getTime();
function tick(){
  let diff = Math.max(0, weddingDate - Date.now());
  const d = Math.floor(diff/86400000); diff%=86400000;
  const h = Math.floor(diff/3600000); diff%=3600000;
  const m = Math.floor(diff/60000); diff%=60000;
  const s = Math.floor(diff/1000);
  document.getElementById('days').textContent = String(d).padStart(2,'0');
  document.getElementById('hours').textContent = String(h).padStart(2,'0');
  document.getElementById('mins').textContent = String(m).padStart(2,'0');
  document.getElementById('secs').textContent = String(s).padStart(2,'0');
}
tick(); setInterval(tick,1000);

// Story carousel: swipe plus explicit previous/next buttons.
const track = document.getElementById('storyTrack');
const frame = document.querySelector('.story-frame');
const storyCount = document.getElementById('storyCount');
const prevBtn = document.getElementById('storyPrev');
const nextBtn = document.getElementById('storyNext');
let storyIndex=0, startX=0, deltaX=0, dragging=false;
function updateStory(){
  track.style.transform = `translateX(-${storyIndex*100}%)`;
  storyCount.textContent = `${String(storyIndex+1).padStart(2,'0')} / 05`;
  prevBtn.disabled = storyIndex === 0;
  nextBtn.disabled = storyIndex === 4;
  prevBtn.style.opacity = storyIndex === 0 ? '.45' : '1';
  nextBtn.style.opacity = storyIndex === 4 ? '.45' : '1';
}
function goStory(step){ storyIndex=Math.max(0,Math.min(4,storyIndex+step)); updateStory(); }
prevBtn.addEventListener('click',()=>goStory(-1));
nextBtn.addEventListener('click',()=>goStory(1));
frame.addEventListener('pointerdown', e=>{dragging=true;startX=e.clientX;deltaX=0;frame.setPointerCapture(e.pointerId)});
frame.addEventListener('pointermove', e=>{if(dragging) deltaX=e.clientX-startX});
frame.addEventListener('pointerup', e=>{if(!dragging)return;dragging=false;if(Math.abs(deltaX)>45)goStory(deltaX<0?1:-1);try{frame.releasePointerCapture(e.pointerId)}catch(err){}});
frame.addEventListener('pointercancel', ()=>{dragging=false});
updateStory();

const videoObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    const video=entry.target;
    if(entry.isIntersecting){ video.muted=true; video.loop=true; video.play().catch(()=>{}); }
    else video.pause();
  });
},{threshold:.45});
document.querySelectorAll('.lazy-video').forEach(v=>videoObserver.observe(v));

const revealObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add('in-view'); });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
