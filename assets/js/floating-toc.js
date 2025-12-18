// Floating Table of Contents (스크롤 따라다니기 - 수정)
(function() {
  'use strict';
  
  function initTOC() {
    // 모바일에서는 실행하지 않음
    if (window.DEVICE && (window.DEVICE.isMobile || window.DEVICE.isTablet)) {
      return;
    }
    
    const toc = document.getElementById('floating-toc');
    if (!toc) return;
    
    const tocNav = toc.querySelector('.toc-nav');
    if (!tocNav) return;
    
    const postContent = document.querySelector('.post-content');
    if (!postContent) return;
    
    const headings = postContent.querySelectorAll('h2, h3, h4');
    if (headings.length === 0) {
      toc.style.display = 'none';
      return;
    }
    
    // Create TOC links
    const tocList = document.createElement('ul');
    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      if (!heading.id) {
        heading.id = id;
      }
      
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = heading.textContent;
      a.classList.add('toc-link');
      
      if (heading.tagName === 'H3') {
        a.style.paddingLeft = '1.5rem';
      } else if (heading.tagName === 'H4') {
        a.style.paddingLeft = '2.5rem';
      }
      
      li.appendChild(a);
      tocList.appendChild(li);
    });
    
    tocNav.appendChild(tocList);
    
    // Show TOC when scrolled
    function checkTocVisibility() {
      const scrollPosition = window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
      const heroHeight = document.querySelector('.hero-section')?.offsetHeight || 0;
      
      if (scrollPosition > heroHeight + 200 || scrollPosition > 300) {
        toc.classList.add('visible');
      } else {
        toc.classList.remove('visible');
      }
    }
    
    // Update TOC position to follow scroll - 핵심 수정
    function updateTocPosition() {
      const scrollPosition = window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const tocHeight = toc.offsetHeight || 300;
      const headerHeight = 80;
      
      if (!toc.classList.contains('visible')) {
        toc.style.top = '50%';
        toc.style.transform = 'translateY(-50%)';
        return;
      }
      
      // 화면 중앙 기준으로 위치 계산
      const centerTop = scrollPosition + (windowHeight / 2) - (tocHeight / 2);
      
      // 경계 제한
      const maxTop = headerHeight + 20;
      const minTop = windowHeight - tocHeight - 20;
      const targetTop = Math.max(maxTop, Math.min(minTop, centerTop));
      
      // !important로 강제 적용
      toc.style.setProperty('top', targetTop + 'px', 'important');
      toc.style.setProperty('transform', 'none', 'important');
      toc.style.setProperty('position', 'fixed', 'important');
    }
    
    // Highlight active heading
    const links = tocNav.querySelectorAll('.toc-link');
    function highlightActiveHeading() {
      const scrollPosition = (window.pageYOffset || window.scrollY || document.documentElement.scrollTop) + 150;
      
      let current = '';
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const headingTop = rect.top + (window.pageYOffset || window.scrollY || document.documentElement.scrollTop);
        if (scrollPosition >= headingTop) {
          current = heading.id;
        }
      });
      
      links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }
    
    // Smooth scroll for TOC links
    tocNav.addEventListener('click', (e) => {
      if (e.target.classList.contains('toc-link')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          const headerOffset = 100;
          const rect = target.getBoundingClientRect();
          const elementPosition = rect.top + (window.pageYOffset || window.scrollY || document.documentElement.scrollTop);
          const offsetPosition = elementPosition - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
    
    // Update on scroll
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkTocVisibility();
          updateTocPosition();
          highlightActiveHeading();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', () => {
      updateTocPosition();
    }, { passive: true });
    
    // Initial check
    setTimeout(() => {
      checkTocVisibility();
      updateTocPosition();
    }, 100);
  }
  
  // DOMContentLoaded 또는 즉시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.DEVICE) {
        initTOC();
      } else {
        const checkDevice = setInterval(() => {
          if (window.DEVICE) {
            clearInterval(checkDevice);
            initTOC();
          }
        }, 50);
        setTimeout(() => {
          clearInterval(checkDevice);
          initTOC();
        }, 1000);
      }
    });
  } else {
    if (window.DEVICE) {
      initTOC();
    } else {
      setTimeout(() => initTOC(), 100);
    }
  }
})();
