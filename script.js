/* Theme, Comet Cursor, Dynamic Glow & Skill Bar Animation Script */
(function(){
  // ==========================================
  // 1. THEME TOGGLE (DARK/LIGHT MODE)
  // ==========================================
  const doc = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  let isDark = saved ? saved === 'dark' : prefersDark;
  
  function applyTheme(dark){
    if(dark){ doc.setAttribute('data-theme','dark'); if(toggle) toggle.setAttribute('aria-pressed','true'); }
    else { doc.removeAttribute('data-theme'); if(toggle) toggle.setAttribute('aria-pressed','false'); }
    try{ localStorage.setItem('theme', dark ? 'dark' : 'light'); }catch(e){}
  }
  
  if(toggle){ toggle.addEventListener('click', ()=>{ isDark = !isDark; applyTheme(isDark); }); }
  applyTheme(isDark);

  // ==========================================
  // 2. NAVIGASI YANG MELEBAR SAAT HALAMAN DIGULIR
  // ==========================================
  const navWrap = document.querySelector('.nav-wrap');
  const navMenuToggle = document.querySelector('.nav-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  function updateNavOnScroll(){
    if(navWrap) navWrap.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', updateNavOnScroll, {passive:true});
  updateNavOnScroll();

  function setMobileMenuOpen(open){
    if(!navWrap || !navMenuToggle) return;
    navWrap.classList.toggle('menu-open', open);
    navMenuToggle.setAttribute('aria-expanded', String(open));
    navMenuToggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
  }
  if(navMenuToggle){
    navMenuToggle.addEventListener('click', ()=>{
      setMobileMenuOpen(navMenuToggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  if(navLinks){
    navLinks.addEventListener('click', event=>{
      if(event.target instanceof Element && event.target.closest('a')) setMobileMenuOpen(false);
    });
  }
  document.addEventListener('keydown', event=>{
    if(event.key === 'Escape') setMobileMenuOpen(false);
  });

  // ==========================================
  // 3. PERSIAPAN KURSOR (GLOW & KOMET)
  // ==========================================
  const glow = document.getElementById('cursor-glow');
  
  // Sembunyikan kursor lama bawaan HTML (jika ada)
  const oldCur = document.getElementById('cur');
  const oldRing = document.getElementById('cur-ring');
  if(oldCur) oldCur.style.display = 'none';
  if(oldRing) oldRing.style.display = 'none';

  // Buat Elemen Kepala Komet
  const cometHead = document.createElement('div');
  cometHead.className = 'comet-head';
  document.body.appendChild(cometHead);

  // Buat Elemen Ekor Komet (15 partikel)
  const tailCount = 15; 
  const tails = [];
  for (let i = 0; i < tailCount; i++) {
    const tail = document.createElement('div');
    tail.className = 'comet-tail';
    const scale = 1 - (i / tailCount); // Semakin ke ujung semakin kecil & transparan
    tail.style.opacity = scale;
    document.body.appendChild(tail);
    tails.push({ el: tail, x: window.innerWidth/2, y: window.innerHeight/2, scale: scale });
  }

  // Efek hover untuk link dan tombol (Menggunakan Event Delegation agar lebih responsif)
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .btn, .pn, .tool-badge, .proj, .cert')) {
      cometHead.classList.add('comet-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .btn, .pn, .tool-badge, .proj, .cert')) {
      cometHead.classList.remove('comet-hover');
    }
  });

  // Variabel Pelacakan Mouse
  let targetX = window.innerWidth/2, targetY = window.innerHeight/2;
  let px = targetX, py = targetY; // Posisi semburat warna yang ikut mengejar pergerakan komet
  
  function setBg(){
    if(!glow) return;
    const gx = ((px/window.innerWidth)*100).toFixed(2) + '%';
    const gy = ((py/window.innerHeight)*100).toFixed(2) + '%';
    const g2x = (((px+120)/window.innerWidth)*100).toFixed(2) + '%';
    const g2y = (((py-80)/window.innerHeight)*100).toFixed(2) + '%';
    const cs = getComputedStyle(document.documentElement);
    const c1 = cs.getPropertyValue('--glow-1') || 'rgba(91,76,251,0.16)';
    const c2 = cs.getPropertyValue('--glow-2') || 'rgba(255,176,32,0.08)';
    glow.style.background = `radial-gradient(420px circle at ${gx} ${gy}, ${c1.trim()}, transparent 30%), radial-gradient(260px circle at ${g2x} ${g2y}, ${c2.trim()}, transparent 28%)`;
  }

  // ==========================================
  // 4. ANIMASI UTAMA (GLOW MENGIKUTI KOMET)
  // ==========================================
  let raf = null;
  function animate(){
    // A. Semburat warna (glow) bergerak dinamis mengikuti arah komet dengan kelambatan halus (easing 0.12)
    px += (targetX - px) * 0.12;
    py += (targetY - py) * 0.12;
    setBg();

    // B. Posisi Kepala Komet (Instan mengikuti mouse)
    cometHead.style.left = `${targetX}px`;
    cometHead.style.top = `${targetY}px`;

    // C. Posisi Ekor Komet (Mengekor dengan easing 0.4)
    let currentX = targetX;
    let currentY = targetY;
    
    tails.forEach((tailObj) => {
      tailObj.x += (currentX - tailObj.x) * 0.4;
      tailObj.y += (currentY - tailObj.y) * 0.4;

      tailObj.el.style.left = `${tailObj.x}px`;
      tailObj.el.style.top = `${tailObj.y}px`;
      tailObj.el.style.transform = `translate(-50%, -50%) scale(${tailObj.scale})`;

      currentX = tailObj.x;
      currentY = tailObj.y;
    });

    raf = requestAnimationFrame(animate);
  }
  
  animate(); // Jalankan loop animasi

  // ==========================================
  // 5. EVENT LISTENER MOUSE & TOUCH
  // ==========================================
  window.addEventListener('mousemove', (e) => { 
    targetX = e.clientX; 
    targetY = e.clientY; 
    if(glow) glow.style.opacity = '1'; 
  }, {passive:true});
  
  window.addEventListener('pointerleave', () => { 
    if(glow) glow.style.opacity = '0'; 
  }, {passive:true});
  
  window.addEventListener('touchmove', (e) => { 
    if(e.touches && e.touches[0]){ 
      targetX = e.touches[0].clientX; 
      targetY = e.touches[0].clientY; 
    } 
  }, {passive:true});
  
  window.addEventListener('resize', () => { 
    setBg(); 
  });

  // ==========================================
  // 6. ANIMASI PROGRESS BAR HARD SKILLS
  // ==========================================
  document.addEventListener("DOMContentLoaded", function () {
    const skillsSection = document.getElementById("skills");
    if (!skillsSection) return;

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const skillLines = document.querySelectorAll(".skill-line");
          skillLines.forEach(line => {
            line.classList.add("animate");
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(skillsSection);
  });
})();