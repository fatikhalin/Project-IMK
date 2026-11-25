(() => {
  const frame = document.getElementById('meetzy-frame');

  function fitDesktop() {
    frame.style.zoom = document.documentElement.clientWidth / frame.offsetWidth;
  }

  fitDesktop();
  window.addEventListener('resize', fitDesktop);
})();
