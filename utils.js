function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
  }
  
  function setWallColor(color) {
    scene.background = new THREE.Color(color);
    draw2D(); // optional if you show wall color in 2D
  }
  