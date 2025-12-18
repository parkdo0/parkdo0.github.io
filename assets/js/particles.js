// Particles Background Effect
(function() {
  'use strict';
  
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  
  // Set canvas size (고해상도 최적화)
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
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
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 250);
  });
  
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
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const baseCount = Math.floor((rect.width * rect.height) / 15000);
    // 고해상도에서는 파티클 수를 조정 (너무 많으면 성능 저하)
    const particleCount = dpr > 1 ? Math.min(baseCount, 150) : baseCount;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }
  
  // Connect nearby particles
  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 217, 255, ${0.1 * (1 - distance / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }
  
  // Animation loop (고해상도 최적화)
  function animate() {
    // 고해상도에서 성능 최적화
    const dpr = window.devicePixelRatio || 1;
    if (dpr > 2) {
      // 초고해상도에서는 연결선을 간소화
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // 파티클 수가 많으면 연결선 생략
      if (particles.length < 100) {
        connectParticles();
      }
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      connectParticles();
    }
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Initialize
  initParticles();
  animate();
})();

