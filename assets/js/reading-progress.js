// Reading Progress Bar (성능 최적화)
(function() {
  'use strict';
  
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;
  
  let ticking = false;
  let scrollHandler = null;
  
  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const scrollableHeight = documentHeight - windowHeight;
    const scrolled = scrollTop / scrollableHeight;
    
    progressBar.style.transform = `scaleX(${Math.min(scrolled, 1)})`;
    ticking = false;
  }
  
  // Throttle scroll events with requestAnimationFrame
  scrollHandler = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', scrollHandler, { passive: true });
  
  // Initial update
  updateProgress();
  
  // Cleanup
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('scroll', scrollHandler);
  });
})();
