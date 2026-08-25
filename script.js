/**
 * 3D Developer Portfolio Interactive Script - Vinit Kumar
 * Features:
 * 1. Cyberpunk Tron 3D Neon Grid & Undulating Wave Terrain (Three.js) with Mouse Ripples
 * 2. 3D Card Tilt Physics with Specular Sheen Lighting
 * 3. Typewriter Engine for Dynamic Role Cycling
 * 4. Interactive Clipboard Copying with Visual Feedback
 * 5. Responsive Mobile Navigation & ScrollSpy
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize modules
  initTronWave3D();
  init3DCardTilt();
  initTypewriter();
  initClipboard();
  initMobileNav();
  initScrollSpy();
});

/* ==========================================================================
   1. CYBERPUNK TRON 3D NEON GRID & UNDULATING WAVE TERRAIN
   ========================================================================== */
function initTronWave3D() {
  const canvas = document.getElementById('bg-3d');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050813, 0.012);

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 22, 55);
  camera.rotation.x = -0.32;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- 1.1 Dynamic 3D Wave Terrain Plane ---
  const terrainWidth = 260;
  const terrainDepth = 200;
  const gridSegmentsX = 85;
  const gridSegmentsY = 65;

  const terrainGeo = new THREE.PlaneGeometry(terrainWidth, terrainDepth, gridSegmentsX, gridSegmentsY);
  terrainGeo.rotateX(-Math.PI / 2);

  // Store original base vertex positions for smooth wave calculations
  const posAttribute = terrainGeo.attributes.position;
  const basePositions = new Float32Array(posAttribute.count * 3);
  for (let i = 0; i < posAttribute.count * 3; i++) {
    basePositions[i] = posAttribute.array[i];
  }

  // Neon Wireframe Material with Tron Aesthetics
  const terrainMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.position.set(0, -10, -20);
  scene.add(terrainMesh);

  // Secondary Bottom Glowing Mirror Grid (Deep Cyber Space)
  const mirrorGeo = new THREE.PlaneGeometry(terrainWidth * 1.2, terrainDepth * 1.2, 30, 25);
  mirrorGeo.rotateX(-Math.PI / 2);
  const mirrorMat = new THREE.MeshBasicMaterial({
    color: 0x9333ea,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });
  const mirrorMesh = new THREE.Mesh(mirrorGeo, mirrorMat);
  mirrorMesh.position.set(0, -18, -25);
  scene.add(mirrorMesh);

  // --- 1.2 Floating Cyber Neon Particles ---
  const particleCount = 180;
  const particleGeo = new THREE.BufferGeometry();
  const particleCoords = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  const colorsList = [
    new THREE.Color(0x00f2fe), // Tron Cyan
    new THREE.Color(0xff007f), // Cyber Pink
    new THREE.Color(0xa855f7), // Neon Purple
    new THREE.Color(0x38bdf8)  // Sky Neon
  ];

  for (let i = 0; i < particleCount; i++) {
    particleCoords[i * 3] = (Math.random() - 0.5) * 220;
    particleCoords[i * 3 + 1] = Math.random() * 50 - 5;
    particleCoords[i * 3 + 2] = (Math.random() - 0.5) * 160 - 20;

    const col = colorsList[Math.floor(Math.random() * colorsList.length)];
    particleColors[i * 3] = col.r;
    particleColors[i * 3 + 1] = col.g;
    particleColors[i * 3 + 2] = col.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particleCoords, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 2.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  const cyberParticles = new THREE.Points(particleGeo, particleMat);
  scene.add(cyberParticles);

  // --- 1.3 Floating Cyber Prism / Data Crystal in Space ---
  const crystalGeo = new THREE.OctahedronGeometry(9, 0);
  const crystalMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
  crystalMesh.position.set(45, 12, -15);
  scene.add(crystalMesh);

  // Inner glowing core of the crystal
  const coreGeo = new THREE.IcosahedronGeometry(4, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xff007f,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  crystalMesh.add(coreMesh);

  // --- 1.4 Mouse Interaction & Interactive Terrain Ripples ---
  let mouseX = 0;
  let mouseY = 0;
  let targetCamX = 0;
  let targetCamY = 22;

  // Normalized cursor coords for raycasting/wave ripple epicenter
  let normMouseX = 0;
  let normMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.03;

    normMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    normMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Responsive Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerWidth < 1024) {
      crystalMesh.position.set(0, 24, -30);
      crystalMesh.scale.set(0.65, 0.65, 0.65);
    } else {
      crystalMesh.position.set(45, 12, -15);
      crystalMesh.scale.set(1, 1, 1);
    }
  });

  if (window.innerWidth < 1024) {
    crystalMesh.position.set(0, 24, -30);
    crystalMesh.scale.set(0.65, 0.65, 0.65);
  }

  // --- 1.5 Animation Render Loop ---
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth Camera lerp following mouse
    targetCamX += (mouseX - targetCamX) * 0.04;
    targetCamY += (22 - mouseY - targetCamY) * 0.04;
    camera.position.x = targetCamX;
    camera.position.y = Math.max(14, targetCamY);
    camera.lookAt(0, -2, -40);

    // --- Dynamic Undulating Wave Calculations ---
    const posArr = terrainGeo.attributes.position.array;
    const vertexCount = posAttribute.count;

    // Mouse world ripple center
    const rippleCenterX = normMouseX * 60;
    const rippleCenterZ = -normMouseY * 40 - 20;

    for (let i = 0; i < vertexCount; i++) {
      const vx = basePositions[i * 3];
      const vz = basePositions[i * 3 + 2];

      // Primary Cyber wave oscillation
      let waveY = Math.sin(vx * 0.07 + elapsedTime * 1.8) * 3.8 +
                  Math.cos(vz * 0.08 + elapsedTime * 1.4) * 3.2;

      // Secondary micro ripples
      waveY += Math.sin((vx + vz) * 0.05 + elapsedTime * 2.2) * 1.5;

      // Mouse Proximity Dynamic Ripple
      const dx = vx - rippleCenterX;
      const dz = vz - rippleCenterZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 45) {
        const influence = (1 - dist / 45);
        waveY += Math.sin(dist * 0.3 - elapsedTime * 4.0) * (influence * 4.5);
      }

      posArr[i * 3 + 1] = waveY;
    }

    terrainGeo.attributes.position.needsUpdate = true;

    // Rotate Data Crystal
    crystalMesh.rotation.x = elapsedTime * 0.25;
    crystalMesh.rotation.y = elapsedTime * 0.35;
    coreMesh.rotation.z = -elapsedTime * 0.5;
    crystalMesh.position.y = 12 + Math.sin(elapsedTime * 1.2) * 2.5;

    // Move cyber particles upward slowly
    const pArr = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pArr[i * 3 + 1] += 0.06;
      if (pArr[i * 3 + 1] > 45) {
        pArr[i * 3 + 1] = -10;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   2. 3D CARD TILT & SPECULAR SHEEN ENGINE
   ========================================================================== */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.card-3d');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (max ~10 degrees)
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      // Apply 3D perspective transform
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;

      // Pass coordinates to CSS custom properties for specular glare
      card.style.setProperty('--mouse-x', `${(x - centerX)}px`);
      card.style.setProperty('--mouse-y', `${(y - centerY)}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.transition = 'transform 0.5s ease-out, border-color 0.3s ease, box-shadow 0.3s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out, border-color 0.3s ease, box-shadow 0.3s ease';
    });
  });
}

/* ==========================================================================
   3. TYPEWRITER EFFECT ENGINE
   ========================================================================== */
function initTypewriter() {
  const typingElement = document.getElementById('typing-text');
  if (!typingElement) return;

  const roles = [
    'Aspiring Software Developer',
    'Frontend & Web Developer (HTML, CSS, JS)',
    'AI & ML Enthusiast',
    'Azure Cloud AZ-900 Certified',
    'Python & SQL Developer',
    'Problem Solver & Tech Builder'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 75;
  const deleteSpeed = 35;
  const pauseEnd = 1600;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typingElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentRole.length) {
      delay = pauseEnd;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 350;
    }

    setTimeout(type, delay);
  }

  type();
}

/* ==========================================================================
   4. CLIPBOARD COPY ENGINE
   ========================================================================== */
function initClipboard() {
  const copyTriggers = document.querySelectorAll('.copy-trigger');

  copyTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-email') || 'vinitsahu64111@gmail.com';

      const showSuccess = () => {
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check" style="color: #22c55e;"></i> <span>Copied!</span>';
        btn.style.borderColor = '#22c55e';

        setTimeout(() => {
          btn.innerHTML = originalContent;
          btn.style.borderColor = '';
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showSuccess).catch(() => {
          fallbackCopy(email, showSuccess);
        });
      } else {
        fallbackCopy(email, showSuccess);
      }
    });
  });

  function fallbackCopy(text, callback) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      callback();
    } catch (err) {
      console.warn('Copy failed:', err);
    }
    document.body.removeChild(textarea);
  }
}

/* ==========================================================================
   5. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        const icon = toggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }
}

/* ==========================================================================
   6. SCROLL SPY & REVEAL ANIMATIONS
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-item');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });
}
