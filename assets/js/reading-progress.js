// Reading Progress Bar
(function() {
  'use strict';
  
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;
  
  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const scrollableHeight = documentHeight - windowHeight;
    const scrolled = scrollTop / scrollableHeight;
    
    progressBar.style.transform = `scaleX(${Math.min(scrolled, 1)})`;
  }
  
  // Throttle scroll events
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Initial update
  updateProgress();
})();

