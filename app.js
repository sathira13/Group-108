let scene, camera, renderer, raycaster, mouse;
let selectedObject = null;
let isDragging = false;
let plane = null;
let dragOffset = new THREE.Vector3();
const objects = [];

const canvas2d = document.getElementById('canvas2d');
const ctx = canvas2d.getContext('2d');

function draw2D() {
  ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
  objects.forEach(obj => {
    const x = (obj.position.x + 10) * 20;
    const z = (obj.position.z + 10) * 15;
    ctx.fillStyle = obj.userData.type === 'chair' ? 'red' : 'blue';
    if (obj.userData.type === 'chair') {
      ctx.fillRect(x - 10, z - 10, 20, 20);
    } else {
      ctx.beginPath();
      ctx.arc(x, z, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function init3D() {
  const canvasContainer = document.getElementById("canvas3d");
  const width = canvasContainer.clientWidth;
  const height = canvasContainer.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color('#f0f0f0');

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 10, 15);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  canvasContainer.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(10, 20, 10);
  scene.add(ambient, directional);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0xdddddd })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.name = 'floor';
  scene.add(floor);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function loadModel(type, x, z, rotationY = 0) {
  let mesh;
  if (type === 'chair') {
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    mesh.position.set(x, 0.5, z);
  } else {
    mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 0.3, 32),
      new THREE.MeshStandardMaterial({ color: 0x0000ff })
    );
    mesh.position.set(x, 0.15, z);
  }

  if (mesh) {
    mesh.userData.type = type;
    mesh.rotation.y = rotationY;
    scene.add(mesh);
    objects.push(mesh);
    saveLayout();
    draw2D();
  }
}

function addChair() {
  const x = Math.random() * 10 - 5;
  const z = Math.random() * 10 - 5;
  loadModel('chair', x, z);
}

function addTable() {
  const x = Math.random() * 10 - 5;
  const z = Math.random() * 10 - 5;
  loadModel('table', x, z);
}

function setupDragging() {
  renderer.domElement.addEventListener('mousedown', (event) => {
    mouse.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects, true);
    if (intersects.length > 0) {
      selectedObject = intersects[0].object;
      while (selectedObject.parent && !objects.includes(selectedObject)) {
        selectedObject = selectedObject.parent;
      }
      plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      dragOffset.copy(intersection).sub(selectedObject.position);
      isDragging = true;
    }
  });

  renderer.domElement.addEventListener('mousemove', (event) => {
    if (!isDragging || !selectedObject) return;
    mouse.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersection = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, intersection)) {
      selectedObject.position.x = intersection.x - dragOffset.x;
      selectedObject.position.z = intersection.z - dragOffset.z;
      draw2D();
    }
  });

  renderer.domElement.addEventListener('mouseup', () => {
    if (isDragging && selectedObject) {
      selectedObject.position.x = Math.round(selectedObject.position.x);
      selectedObject.position.z = Math.round(selectedObject.position.z);
      saveLayout();
      draw2D();
    }
    isDragging = false;
    selectedObject = null;
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' && selectedObject) {
    scene.remove(selectedObject);
    const index = objects.indexOf(selectedObject);
    if (index > -1) objects.splice(index, 1);
    selectedObject = null;
    saveLayout();
    draw2D();
  }

  if ((e.key === 'r' || e.key === 'R') && selectedObject) {
    selectedObject.rotation.y += Math.PI / 4;
    saveLayout();
    draw2D();
  }
});

function saveLayout() {
  const layout = objects.map(obj => ({
    type: obj.userData.type,
    x: obj.position.x,
    z: obj.position.z,
    rotationY: obj.rotation.y
  }));
  localStorage.setItem('furniture3d', JSON.stringify(layout));
}

function loadLayout() {
  const data = JSON.parse(localStorage.getItem('furniture3d') || '[]');
  data.forEach(item => loadModel(item.type, item.x, item.z, item.rotationY));
}

function clearLayout() {
  objects.forEach(obj => scene.remove(obj));
  objects.length = 0;
  localStorage.removeItem('furniture3d');
  draw2D();
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// Role-based visibility
const role = localStorage.getItem('role')?.trim() || 'Guest';
document.getElementById('userRole').textContent = role;
if (role.toLowerCase().includes('customer')) {
  const tools = document.getElementById('adminTools');
  if (tools) tools.style.display = 'none';
}

init3D();
setupDragging();
draw2D();
loadLayout();
