// Floating Table of Contents (성능 최적화 + 스크롤 따라다니기)
(function() {
  'use strict';
  
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
    const scrollPosition = window.pageYOffset;
    const heroHeight = document.querySelector('.hero-section')?.offsetHeight || 0;
    
    if (scrollPosition > heroHeight + 200) {
      toc.classList.add('visible');
    } else {
      toc.classList.remove('visible');
    }
  }
  
  // Update TOC position to follow scroll
  function updateTocPosition() {
    if (!toc.classList.contains('visible')) return;
    
    const windowHeight = window.innerHeight;
    const tocHeight = toc.offsetHeight;
    const headerHeight = 80; // 헤더 높이
    const scrollTop = window.pageYOffset;
    
    // TOC가 화면 밖으로 나가지 않도록 제한
    const maxTop = headerHeight + 20;
    const minTop = windowHeight - tocHeight - 20;
    const centerTop = scrollTop + (windowHeight / 2) - (tocHeight / 2);
    
    // 범위 내에서 위치 조정
    let targetTop = Math.max(maxTop, Math.min(minTop, centerTop));
    
    // translateY 대신 top 사용 (스크롤 따라다니기)
    toc.style.top = targetTop + 'px';
    toc.style.transform = 'none';
  }
  
  // Highlight active heading (캐싱으로 최적화)
  const links = tocNav.querySelectorAll('.toc-link');
  function highlightActiveHeading() {
    const scrollPosition = window.pageYOffset + 150;
    
    let current = '';
    headings.forEach((heading) => {
      const headingTop = heading.getBoundingClientRect().top + window.pageYOffset;
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
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
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
  window.addEventListener('resize', updateTocPosition, { passive: true });
  
  // Initial check
  checkTocVisibility();
  updateTocPosition();
  
  // Cleanup
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('scroll', scrollHandler);
    window.removeEventListener('resize', updateTocPosition);
  });
})();
