// Floating Table of Contents (성능 최적화 + 스크롤 따라다니기)
(function() {
  'use strict';
  
  // device-detector가 로드될 때까지 기다림
  function initTOC() {
    // 모바일에서는 실행하지 않음
    if (window.DEVICE && (window.DEVICE.isMobile || window.DEVICE.isTablet)) {
      return;
    }
    
    const toc = document.getElementById('floating-toc');
    if (!toc) return;
    
    const tocNav = toc.querySelector('.toc-nav');
    if (!tocNav) return;
    
    // Get all headings from post content
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
      
      // Add indentation based on heading level
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
      const scrollPosition = window.pageYOffset || window.scrollY;
      const heroHeight = document.querySelector('.hero-section')?.offsetHeight || 0;
      
      if (scrollPosition > heroHeight + 200 || scrollPosition > 300) {
        toc.classList.add('visible');
      } else {
        toc.classList.remove('visible');
      }
    }
    
    // Update TOC position to follow scroll
    function updateTocPosition() {
      if (!toc.classList.contains('visible')) {
        // visible이 아니면 초기 위치로
        toc.style.top = '50%';
        toc.style.transform = 'translateY(-50%)';
        return;
      }
      
      const windowHeight = window.innerHeight;
      const tocHeight = toc.offsetHeight;
      const headerHeight = 80;
      const scrollTop = window.pageYOffset || window.scrollY;
      
      // TOC가 화면 밖으로 나가지 않도록 제한
      const maxTop = headerHeight + 20;
      const minTop = windowHeight - tocHeight - 20;
      const centerTop = scrollTop + (windowHeight / 2) - (tocHeight / 2);
      
      // 범위 내에서 위치 조정
      let targetTop = Math.max(maxTop, Math.min(minTop, centerTop));
      
      // top으로 위치 설정 (스크롤 따라다니기)
      toc.style.top = targetTop + 'px';
      toc.style.transform = 'none';
    }
    
    // Highlight active heading
    const links = tocNav.querySelectorAll('.toc-link');
    function highlightActiveHeading() {
      const scrollPosition = (window.pageYOffset || window.scrollY) + 150;
      
      let current = '';
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const headingTop = rect.top + (window.pageYOffset || window.scrollY);
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
          const elementPosition = rect.top + (window.pageYOffset || window.scrollY);
          const offsetPosition = elementPosition - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
    
    // Update on scroll (throttled)
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
    checkTocVisibility();
    updateTocPosition();
    
    // Cleanup
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('scroll', scrollHandler);
    });
  }
  
  // device-detector가 로드되었는지 확인
  if (window.DEVICE) {
    initTOC();
  } else {
    // device-detector가 아직 로드되지 않았으면 기다림
    const checkDevice = setInterval(() => {
      if (window.DEVICE) {
        clearInterval(checkDevice);
        initTOC();
      }
    }, 50);
    
    // 최대 2초 대기
    setTimeout(() => {
      clearInterval(checkDevice);
      if (!window.DEVICE) {
        // device-detector가 없으면 데스크톱으로 가정하고 실행
        initTOC();
      }
    }, 2000);
  }
})();
