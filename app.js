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
  camera.position.set(0, 2.2, 6);

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
  ground.position.y = -1.2;
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
  // Single round blob monster
  const bodyMat = new THREE.MeshStandardMaterial({ color:0x7de3ff, roughness:0.35, metalness:0.08, emissive:0x002a35, emissiveIntensity:0.15, flatShading: false });
  const bodyGeo = new THREE.SphereGeometry(1.2, 64, 64);
  const blob = new THREE.Mesh(bodyGeo, bodyMat);
  blob.position.set(0, 0, 0);
  blob.castShadow = true;
  blob.receiveShadow = true;
  monsterGroup.add(blob);

  // Eyes (front-facing)
  const eyeGeo = new THREE.SphereGeometry(0.11, 16, 12);
  const eyeMat = new THREE.MeshStandardMaterial({ color:0x001018, roughness:0.2, metalness:0.3 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  const rightEye = leftEye.clone();
  leftEye.position.set(-0.35, 0.15, 1.02);
  rightEye.position.set(0.35, 0.15, 1.02);
  monsterGroup.add(leftEye, rightEye);

  // Eye glints
  const glintGeo = new THREE.CircleGeometry(0.04, 12);
  const glintMat = new THREE.MeshBasicMaterial({ color:0xffffff });
  const g1 = new THREE.Mesh(glintGeo, glintMat); g1.position.set(-0.28,0.28,1.06); g1.rotation.x = -0.3;
  const g2 = g1.clone(); g2.position.set(0.4,0.28,1.06);
  monsterGroup.add(g1,g2);

  // subtle material sheen shader injection (kept for blob)
  bodyMat.onBeforeCompile = shader => {
    shader.uniforms.time = { value: 0 };
    shader.fragmentShader = 'uniform float time;\n' + shader.fragmentShader;
    const inject = '\nfloat glow = 0.06 * (0.5 + 0.5 * sin(time * 1.6 + position.y * 2.0));\nvec3 addCol = vec3(0.02,0.06,0.08) * glow;\n#ifdef USE_LIGHTMAP\nmeasuredLambert += addCol;\n#else\nmeasuredLambert += addCol;\n#endif\n';
    shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>' + inject);
    bodyMat.userData._shader = shader;
  };

  // store reference for wobble animation
  monsterGroup.userData.blob = blob;
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

  // update custom shader time
  monsterGroup.traverse(c => {
    if(c.isMesh && c.material && c.material.userData && c.material.userData._shader){
      c.material.userData._shader.uniforms.time.value = t;
    }
  });

  renderer.render(scene, camera);
}
