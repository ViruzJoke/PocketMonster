// Basic Three.js PocketMon demo - procedural monster with simple idle animation and UI interactions
let scene, camera, renderer, monsterGroup, clock, mixer;
let hunger = 50, happiness = 50;

init();
animate();

function init(){
  const container = document.getElementById('scene');
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07102a, 0.02);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.6, 5.2);

  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  hemi.position.set(0, 10, 0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5, 10, 7);
  dir.castShadow = true;
  scene.add(dir);

  // ground
  const groundGeo = new THREE.PlaneGeometry(40,40);
  const groundMat = new THREE.MeshStandardMaterial({ color:0x071436, roughness:0.8, metalness:0.1 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI/2;
  ground.position.y = -1.4;
  scene.add(ground);

  // monster
  monsterGroup = new THREE.Group();
  scene.add(monsterGroup);

  // backdrop plane (forest) - slightly behind the scene
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = '';
  loader.load('https://images.pexels.com/photos/34950/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1600', tex => {
    tex.encoding = THREE.sRGBEncoding;
    const bgMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    const bgGeo = new THREE.PlaneGeometry(30, 12);
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.position.set(0, 1.5, -8);
    scene.add(bg);
  });

  createMonster();

  clock = new THREE.Clock();

  // UI
  document.getElementById('feedBtn').addEventListener('click', () => { feed(); });
  document.getElementById('playBtn').addEventListener('click', () => { playWith(); });
  document.getElementById('cleanBtn').addEventListener('click', () => { clean(); });

  window.addEventListener('resize', onWindowResize);
  // initialize displayed stats
  updateStats();

  // button active visual feedback
  Array.from(document.querySelectorAll('#controls button')).forEach(b => {
    b.addEventListener('pointerdown', () => b.style.transform = 'translateY(1px) scale(0.995)');
    b.addEventListener('pointerup', () => b.style.transform = '');
    b.addEventListener('pointerleave', () => b.style.transform = '');
  });
}

function createMonster(){
  // Hatchling: egg shell + small body that pops out
  const shellMat = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.7, metalness:0.0 });
  const shellGeo = new THREE.SphereGeometry(1.6, 32, 16, 0, Math.PI);
  // bottom half (upright)
  const bottomShell = new THREE.Mesh(shellGeo, shellMat);
  bottomShell.rotation.x = Math.PI; // flip cup
  bottomShell.position.set(0, -0.5, 0);
  bottomShell.scale.set(1.0,0.6,1.0);
  monsterGroup.add(bottomShell);

  // top cracked shell half (rotated outwards)
  const topShell = new THREE.Mesh(shellGeo, shellMat);
  topShell.position.set(0, 0.9, 0);
  topShell.scale.set(1.0,0.6,1.0);
  topShell.rotation.x = -0.6;
  monsterGroup.add(topShell);

  // small hatchling body
  const bodyMat = new THREE.MeshStandardMaterial({ color:0x9fe8ff, roughness:0.32, metalness:0.02, emissive:0x001822, emissiveIntensity:0.06, clearcoat:0.5, clearcoatRoughness:0.18 });
  const bodyGeo = new THREE.SphereGeometry(0.9, 48, 32);
  const chick = new THREE.Mesh(bodyGeo, bodyMat);
  chick.position.set(0, -0.4, 0);
  monsterGroup.add(chick);

  // eyes on chick
  const eyeGeo = new THREE.SphereGeometry(0.08, 12, 10);
  const eyeMat = new THREE.MeshStandardMaterial({ color:0x001018, roughness:0.2, metalness:0.2 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  const rightEye = leftEye.clone();
  leftEye.position.set(-0.22, -0.05, 0.78);
  rightEye.position.set(0.22, -0.05, 0.78);
  chick.add(leftEye, rightEye);

  // glints
  const glintGeo = new THREE.CircleGeometry(0.03, 12);
  const glintMat = new THREE.MeshBasicMaterial({ color:0xffffff });
  const g1 = new THREE.Mesh(glintGeo, glintMat); g1.position.set(-0.18,0.02,0.82); g1.rotation.x = -0.3;
  const g2 = g1.clone(); g2.position.set(0.26,0.02,0.82);
  chick.add(g1,g2);

  // small cheeks
  const cheekGeo = new THREE.SphereGeometry(0.11, 12, 10);
  const cheekMat = new THREE.MeshStandardMaterial({ color:0xffb6c1, roughness:0.6 });
  const c1 = new THREE.Mesh(cheekGeo, cheekMat); c1.position.set(-0.36, -0.12, 0.65); c1.scale.set(1,0.7,0.5);
  const c2 = c1.clone(); c2.position.set(0.36, -0.12, 0.65);
  chick.add(c1,c2);

  // egg hatch state
  monsterGroup.userData.chick = chick;
  monsterGroup.userData.topShell = topShell;
  monsterGroup.userData.bottomShell = bottomShell;
  monsterGroup.userData.hatchProgress = 0; // 0..1
  monsterGroup.userData.hatched = false;
}

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function feed(){
  hunger = Math.max(0, hunger - 15);
  happiness = Math.min(100, happiness + 8);
  flashColor(0x8ef2a6);
  animateBounce(1.15);
  updateStats();
}
function playWith(){
  happiness = Math.min(100, happiness + 18);
  hunger = Math.min(100, hunger + 6);
  animatePlay();
  updateStats();
}
function clean(){
  happiness = Math.min(100, happiness + 6);
  flashColor(0xbfe7ff);
  updateStats();
}

function updateStats(){
  document.getElementById('hunger').innerText = Math.round(hunger);
  document.getElementById('happiness').innerText = Math.round(happiness);
}

function flashColor(hex){
  // temporary emissive flash
  const mats = [];
  monsterGroup.traverse(c => { if(c.isMesh) mats.push(c.material); });
  mats.forEach(m => { if(m.emissive){ const old = m.emissive.clone(); m.emissive.setHex(hex); setTimeout(()=> m.emissive.copy(old), 380); } });
}

function animateBounce(scale){
  // simple tween-like bounce using clock
  const start = performance.now();
  const dur = 420;
  const initScale = monsterGroup.scale.y;
  function step(){
    const t = Math.min(1, (performance.now() - start)/dur);
    const eased = 1 - Math.pow(1-t,3);
    const s = 1 + (scale - 1) * Math.sin(eased * Math.PI);
    monsterGroup.scale.set(s,s,s);
    if(t < 1) requestAnimationFrame(step);
    else monsterGroup.scale.set(1,1,1);
  }
  step();
}

function animatePlay(){
  // simple shake / wag tail
  const start = performance.now();
  const dur = 900;
  function step(){
    const t = (performance.now() - start)/dur;
    if(t > 1) { monsterGroup.rotation.y = 0; return; }
    monsterGroup.rotation.y = Math.sin(t * Math.PI * 6) * 0.2;
    requestAnimationFrame(step);
  }
  step();
}

function animate(){
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  // idle sway (left-right) and subtle rotation
  const t = Date.now() * 0.001;
  monsterGroup.position.x = 0.18 * Math.sin(t * 0.9); // sway on X axis
  monsterGroup.rotation.y = 0.06 * Math.sin(t * 0.6);
  // jelly wobble: scale blob in Y vs XZ
  const blob = monsterGroup.userData.blob;
  if(blob){
    const wobble = 0.04 * Math.sin(t * 4.0) + 0.02 * Math.sin(t * 2.3);
    const sx = 1 + wobble * 0.6;
    const sy = 1 - wobble * 0.8;
    const sz = 1 + wobble * 0.6;
    blob.scale.set(sx, sy, sz);
  }

  // hatchling behavior
  const chick = monsterGroup.userData.chick;
  const topShell = monsterGroup.userData.topShell;
  const bottomShell = monsterGroup.userData.bottomShell;
  if(chick && topShell && bottomShell){
    // progress hatch over first second
    if(!monsterGroup.userData.hatched){
      monsterGroup.userData.hatchProgress = Math.min(1, monsterGroup.userData.hatchProgress + dt * 0.9);
      const p = monsterGroup.userData.hatchProgress;
      // chick rises
      chick.position.y = -0.4 + p * 0.85;
      // top shell rotates out
      topShell.rotation.x = -0.6 - p * 1.4;
      topShell.position.y = 0.9 + p * 0.2;
      // slight bounce when fully hatched
      if(p >= 1){ monsterGroup.userData.hatched = true; }
    } else {
      // idle wiggle for chick
      const wig = 0.02 * Math.sin(t * 5.0) + 0.01 * Math.sin(t * 2.2);
      chick.position.y = 0.45 + wig;
      chick.rotation.y = 0.06 * Math.sin(t * 0.7);
    }
  }

  // update custom shader time
  monsterGroup.traverse(c => {
    if(c.isMesh && c.material && c.material.userData && c.material.userData._shader){
      c.material.userData._shader.uniforms.time.value = t;
    }
  });

  renderer.render(scene, camera);
}
