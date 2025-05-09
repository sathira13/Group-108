function loadModel(type, x, z) {
  let mesh;

  if (type === 'chair') {
    // Red cube for chair
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1), // width, height, depth
      new THREE.MeshStandardMaterial({ color: 0xff0000 }) // red
    );
    mesh.position.set(x, 0.5, z); // y = half height
  }

  else if (type === 'table') {
    // Blue cylinder for table
    mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 0.3, 32), // radiusTop, radiusBottom, height
      new THREE.MeshStandardMaterial({ color: 0x0000ff }) // blue
    );
    mesh.position.set(x, 0.15, z); // y = half height
  }

  // Common for all
  if (mesh) {
    mesh.userData.type = type;
    scene.add(mesh);
    objects.push(mesh);
    saveLayout(); // store in localStorage
  }
}
