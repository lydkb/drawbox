document.addEventListener("DOMContentLoaded", () => {
  const swatches = document.querySelectorAll(".swatch");
  const colorPreview = document.querySelector(".current-colors");

  if(colorPreview) {
    swatches.forEach(swatch => {
      swatch.addEventListener("click", () => {
        const selectedColor = swatch.style.backgroundColor;
        colorPreview.style.backgroundColor = selectedColor;
      });
    });
  }
});
(function() {
  const HEART_COUNT = 30; 
  const COLORS = ['#FFB8DD', '#FFE9B8', '#D4BDFA', '#BDD8FA', '#BDF4FA', '#D3ECC6'];
  const SPAWN_DISTANCE = 10; 
  const hearts = [];
  let poolIndex = 0;
  let lastX = -100;
  let lastY = -100;
  window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const distance = Math.hypot(mouseX - lastX, mouseY - lastY);
    if (distance > SPAWN_DISTANCE) {
      dropHeart(mouseX, mouseY);
      lastX = mouseX;
      lastY = mouseY;
    }
  });
  function createHeart() {
    const el = document.createElement('div');
    el.innerHTML = '♡'; 
    el.style.position = 'fixed';
    el.style.left = '0';
    el.style.top = '0';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '999999'; 
    el.style.fontSize = Math.random() * 12 + 14 + 'px'; 
    el.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.fontWeight = 'bold'; 
    el.style.opacity = '0';
    el.style.willChange = 'transform, opacity';
    document.body.appendChild(el);
    return {
      element: el,
      x: 0,
      y: 0,
      alpha: 0,
      driftX: (Math.random() - 0.5) * 1, 
      fallSpeed: Math.random() * 0.5 + 0.5,
      fadeSpeed: Math.random() * 0.015 + 0.015
    };
  }
  function dropHeart(x, y) {
    const heart = hearts[poolIndex];
    heart.x = x - 6; 
    heart.y = y - 6;
    heart.alpha = 1; 
    
    poolIndex = (poolIndex + 1) % HEART_COUNT;
  }
  function init() {
    for (let i = 0; i < HEART_COUNT; i++) {
      hearts.push(createHeart());
    }
    animate();
  }
  function animate() {
    hearts.forEach((heart) => {
      if (heart.alpha > 0) {
        heart.x += heart.driftX;
        heart.y += heart.fallSpeed;
        heart.alpha -= heart.fadeSpeed; 
        heart.element.style.transform = `translate3d(${heart.x}px, ${heart.y}px, 0)`;
        heart.element.style.opacity = heart.alpha < 0.01 ? 0 : heart.alpha;
      }
    });
    requestAnimationFrame(animate);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
window.addEventListener('load', function() {
  const loader = document.getElementById('site-loader');
  setTimeout(() => {
    loader.classList.add('fade-out');
  }, 666); 
});
