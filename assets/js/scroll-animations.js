// Scroll Animations - Fade In & Slide Up (모바일 최적화)
(function() {
  'use strict';
  
  // 모바일에서는 애니메이션 간소화
  const isMobile = window.DEVICE && window.DEVICE.isMobile;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const observerOptions = {
    threshold: isMobile ? 0.05 : 0.1,
    rootMargin: isMobile ? '0px' : '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (reduceMotion) {
          // 애니메이션 비활성화 설정이면 즉시 표시
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
        } else {
          entry.target.classList.add('visible');
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  function initScrollAnimations() {
    const fadeInElements = document.querySelectorAll('.fade-in, .slide-up, [data-post-card]');
    
    fadeInElements.forEach((el, index) => {
      if (el.hasAttribute('data-post-card')) {
        // 모바일에서는 delay 제거
        if (!isMobile) {
          el.style.animationDelay = `${index * 0.05}s`;
        }
        el.classList.add('fade-in');
      }
      observer.observe(el);
    });
  }
  
  function initHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;
    
    let ticking = false;
    
    const updateHeader = () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      ticking = false;
    };
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateHeader();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollAnimations();
      initHeaderScroll();
    });
  } else {
    initScrollAnimations();
    initHeaderScroll();
  }
  
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });
})();
