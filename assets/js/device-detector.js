// Device Detector - 모바일/데스크톱 감지
(function() {
  'use strict';
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.innerWidth <= 768 && window.matchMedia('(pointer: coarse)').matches);
  
  const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768 && window.innerWidth <= 1024;
  
  const isDesktop = !isMobile && !isTablet;
  
  // 전역 변수로 설정
  window.DEVICE = {
    isMobile: isMobile,
    isTablet: isTablet,
    isDesktop: isDesktop,
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
  };
  
  // body에 클래스 추가
  if (isMobile) {
    document.documentElement.classList.add('is-mobile');
  } else if (isTablet) {
    document.documentElement.classList.add('is-tablet');
  } else {
    document.documentElement.classList.add('is-desktop');
  }
  
  if (window.DEVICE.isTouch) {
    document.documentElement.classList.add('is-touch');
  }
})();

