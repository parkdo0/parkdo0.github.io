// 3D Tilt Effect for Post Cards (성능 최적화)
(function() {
  'use strict';
  
  let tiltHandlers = [];
  let rafId = null;
  
  // Throttle function
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // RequestAnimationFrame 기반 tilt 업데이트
  function updateTilt() {
    tiltHandlers.forEach(handler => {
      if (handler.needsUpdate) {
        handler.update();
        handler.needsUpdate = false;
      }
    });
    rafId = null;
  }
  
  function initTiltEffect() {
    const cards = document.querySelectorAll('[data-post-card]');
    
    cards.forEach(card => {
      const inner = card.querySelector('.post-card-inner');
      if (!inner) return;
      
      const handler = {
        card: card,
        inner: inner,
        needsUpdate: false,
        update: function() {
          if (!this.needsUpdate) return;
          const rect = this.card.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const x = this.lastX - rect.left;
          const y = this.lastY - rect.top;
          
          const rotateX = (y - centerY) / 10;
          const rotateY = (centerX - x) / 10;
          
          this.inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        }
      };
      
      const handleMouseMove = throttle((e) => {
        handler.lastX = e.clientX;
        handler.lastY = e.clientY;
        handler.needsUpdate = true;
        
        if (!rafId) {
          rafId = requestAnimationFrame(updateTilt);
        }
      }, 16); // ~60fps
      
      const handleMouseLeave = () => {
        handler.inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        handler.needsUpdate = false;
      };
      
      card.addEventListener('mousemove', handleMouseMove, { passive: true });
      card.addEventListener('mouseleave', handleMouseLeave);
      
      tiltHandlers.push(handler);
    });
  }
  
  // Mobile menu toggle
  function initMobileMenu() {
    const toggle = document.getElementById('navbar-toggle');
    const menu = document.getElementById('navbar-menu');
    
    if (!toggle || !menu) return;
    
    const handleToggle = () => {
      toggle.classList.toggle('active');
      menu.classList.toggle('active');
    };
    
    const handleClickOutside = (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        toggle.classList.remove('active');
        menu.classList.remove('active');
      }
    };
    
    toggle.addEventListener('click', handleToggle);
    document.addEventListener('click', handleClickOutside);
    
    // Close menu when clicking a link
    const links = menu.querySelectorAll('.navbar-link');
    const handleLinkClick = () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    };
    
    links.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });
  }
  
  // Smooth scroll for anchor links
  function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  // Cleanup function
  function cleanup() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    tiltHandlers = [];
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTiltEffect();
      initMobileMenu();
      initSmoothScroll();
    });
  } else {
    initTiltEffect();
    initMobileMenu();
    initSmoothScroll();
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
})();
