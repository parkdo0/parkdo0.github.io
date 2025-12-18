// Particles Background Effect (데스크톱 전용)
(function() {
  'use strict';
  
  // 모바일에서는 실행하지 않음
  if (window.DEVICE && (window.DEVICE.isMobile || window.DEVICE.isTablet)) {
    return;
  }
  
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;
  let isVisible = true;
  let resizeTimeout = null;
  
  // Set canvas size
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
  }
  
  resizeCanvas();
  
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
      initParticles();
    }, 250);
  }
  
  window.addEventListener('resize', handleResize, { passive: true });
  
  function handleVisibilityChange() {
    isVisible = !document.hidden;
    if (isVisible && !animationId) {
      animate();
    } else if (!isVisible && animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  class Particle {
    constructor() {
      const rect = canvas.getBoundingClientRect();
      this.x = Math.random() * rect.width;
      this.y = Math.random() * rect.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.3 + 0.1;
    }
    
    update() {
      const rect = canvas.getBoundingClientRect();
      this.x += this.speedX;
      this.y += this.speedY;
      
      if (this.x > rect.width) this.x = 0;
      if (this.x < 0) this.x = rect.width;
      if (this.y > rect.height) this.y = 0;
      if (this.y < 0) this.y = rect.height;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 217, 255, ${this.opacity})`;
      ctx.fill();
    }
  }
  
  function initParticles() {
    particles = [];
    const rect = canvas.getBoundingClientRect();
    const particleCount = Math.min(Math.floor((rect.width * rect.height) / 30000), 80);
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }
  
  function connectParticles() {
    const maxDistance = 100;
    const maxConnections = 2;
    
    for (let i = 0; i < particles.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < particles.length && connections < maxConnections; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 217, 255, ${0.08 * (1 - distance / maxDistance)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          connections++;
        }
      }
    }
  }
  
  function animate() {
    if (!isVisible) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    if (particles.length < 60) {
      connectParticles();
    }
    
    animationId = requestAnimationFrame(animate);
  }
  
  initParticles();
  if (isVisible) {
    animate();
  }
  
  window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (resizeTimeout) clearTimeout(resizeTimeout);
  });
})();
