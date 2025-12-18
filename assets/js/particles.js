// Particles Background Effect (성능 최적화)
(function() {
  'use strict';
  
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;
  let isVisible = true;
  let resizeTimeout = null;
  
  // Set canvas size (고해상도 최적화)
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // 최대 2배로 제한
    const rect = canvas.getBoundingClientRect();
    
    // 실제 픽셀 크기
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // CSS 크기
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // 고해상도 스케일링
    ctx.scale(dpr, dpr);
    
    // 고해상도에서 파티클 수 조정
    if (dpr > 1) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
  }
  
  resizeCanvas();
  
  // Throttle resize for performance
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
      initParticles();
    }, 250);
  }
  
  window.addEventListener('resize', handleResize, { passive: true });
  
  // Visibility API로 탭이 보이지 않을 때 애니메이션 중지
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
  
  // Particle class
  class Particle {
    constructor() {
      const rect = canvas.getBoundingClientRect();
      this.x = Math.random() * rect.width;
      this.y = Math.random() * rect.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update() {
      const rect = canvas.getBoundingClientRect();
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Wrap around edges (CSS 크기 기준)
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
  
  // Create particles (고해상도 최적화)
  function initParticles() {
    particles = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const baseCount = Math.floor((rect.width * rect.height) / 20000); // 파티클 수 감소
    // 고해상도에서는 파티클 수를 조정 (너무 많으면 성능 저하)
    const particleCount = Math.min(baseCount, 100); // 최대 100개로 제한
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }
  
  // Connect nearby particles (최적화)
  function connectParticles() {
    const maxDistance = 120;
    const maxConnections = 3; // 각 파티클당 최대 연결 수
    
    for (let i = 0; i < particles.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < particles.length && connections < maxConnections; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 217, 255, ${0.1 * (1 - distance / maxDistance)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          connections++;
        }
      }
    }
  }
  
  // Animation loop (고해상도 최적화)
  function animate() {
    if (!isVisible) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    // 파티클 수가 적을 때만 연결선 그리기
    if (particles.length < 80) {
      connectParticles();
    }
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Initialize
  initParticles();
  if (isVisible) {
    animate();
  }
  
  // Cleanup
  window.addEventListener('beforeunload', () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });
})();
