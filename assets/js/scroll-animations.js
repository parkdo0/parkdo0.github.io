// Scroll Animations - Fade In & Slide Up
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
        // Optional: unobserve after animation
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe elements with animation classes
  function initScrollAnimations() {
    const fadeInElements = document.querySelectorAll('.fade-in, .slide-up, [data-post-card]');
    
    fadeInElements.forEach((el, index) => {
      // Add stagger delay
      if (el.hasAttribute('data-post-card')) {
        el.style.transitionDelay = `${index * 0.1}s`;
        el.classList.add('fade-in');
      }
      observer.observe(el);
    });
  }
  
  // Header scroll effect
  function initHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    });
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
})();

