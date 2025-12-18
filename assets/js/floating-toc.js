// Floating Table of Contents
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
  
  // Highlight active heading
  function highlightActiveHeading() {
    const scrollPosition = window.pageYOffset + 150;
    const links = tocNav.querySelectorAll('.toc-link');
    
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
  
  // Update on scroll
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        checkTocVisibility();
        highlightActiveHeading();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Initial check
  checkTocVisibility();
})();

