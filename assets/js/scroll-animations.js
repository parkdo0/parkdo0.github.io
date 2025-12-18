// Scroll Animations - Fade In & Slide Up (성능 최적화)
(function() {
  'use strict';
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // 메모리 누수 방지: 애니메이션 후 unobserve
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe elements with animation classes
  function initScrollAnimations() {
    const fadeInElements = document.querySelectorAll('.fade-in, .slide-up, [data-post-card]');
    
    fadeInElements.forEach((el, index) => {
      // Add stagger delay via animation-delay
      if (el.hasAttribute('data-post-card')) {
        el.style.animationDelay = `${index * 0.1}s`;
        el.classList.add('fade-in');
      }
      observer.observe(el);
    });
  }
  
  // Header scroll effect (throttled)
  function initHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;
    
    let ticking = false;
    let lastScroll = 0;
    
    const updateHeader = () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
      ticking = false;
    };
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    updateHeader();
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollAnimations();
      initHeaderScroll();
    });
  } else {
    initScrollAnimations();
    initHeaderScroll();
  }
  
  // Cleanup
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });
})();
