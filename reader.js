// ============================
// 不完全な神々 - Reader Script
// ============================

(function () {
  'use strict';

  // --- Reading Progress Bar ---
  const progressBar = document.getElementById('progressBar');
  const proseContent = document.getElementById('proseContent');
  const readingHeader = document.getElementById('readingHeader');

  if (progressBar && proseContent) {
    let lastScroll = 0;
    let ticking = false;

    function updateProgress() {
      const rect = proseContent.getBoundingClientRect();
      const total = proseContent.scrollHeight;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(100, (scrolled / (total - window.innerHeight)) * 100);
      progressBar.style.width = progress + '%';

      // Auto-hide header on scroll down, show on scroll up
      const currentScroll = window.scrollY;
      if (readingHeader) {
        if (currentScroll > lastScroll && currentScroll > 200) {
          readingHeader.classList.add('reading-header--hidden');
        } else {
          readingHeader.classList.remove('reading-header--hidden');
        }
      }
      lastScroll = currentScroll;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    });

    updateProgress();
  }

  // --- Prose Fade-in on Scroll ---
  const paragraphs = document.querySelectorAll('.prose p');
  if (paragraphs.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    paragraphs.forEach((p, i) => {
      p.style.opacity = '0';
      p.style.transform = 'translateY(12px)';
      p.style.transition = `opacity 0.6s ${0.03 * Math.min(i, 5)}s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s ${0.03 * Math.min(i, 5)}s cubic-bezier(0.16, 1, 0.3, 1)`;
      observer.observe(p);
    });
  }
})();
