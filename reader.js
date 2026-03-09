// ============================
// 不完全な神々 - Reader Script
// ============================

(function () {
  'use strict';

  // --- State Management ---
  const STORAGE_KEY = 'mythology_read_state';
  const FONT_SIZE_KEY = 'mythology_font_size';
  
  function getReadEpisodes() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function markAsRead(epNum) {
    let readEps = getReadEpisodes();
    if (!readEps.includes(epNum)) {
      readEps.push(epNum);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(readEps));
      } catch (e) {}
    }
  }

  function getFontSize() {
    return localStorage.getItem(FONT_SIZE_KEY) || 'medium';
  }

  function setFontSize(size) {
    const prose = document.getElementById('proseContent');
    if (prose) {
      prose.classList.remove('text-small', 'text-medium', 'text-large');
      prose.classList.add(`text-${size}`);
      localStorage.setItem(FONT_SIZE_KEY, size);
      
      // Update toggle buttons active state
      document.querySelectorAll('.font-size-btn').forEach(btn => {
        if (btn.dataset.size === size) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  // --- Current Page Logic ---
  const path = window.location.pathname;
  const match = path.match(/episode(\d+)\.html/);
  
  if (match) {
    // We are on an episode page
    const currentEpNum = parseInt(match[1], 10);
    markAsRead(currentEpNum);

    // Apply font size
    setFontSize(getFontSize());

    // Font size controls listeners
    const fontBtns = document.querySelectorAll('.font-size-btn');
    fontBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        setFontSize(e.target.dataset.size);
      });
    });
  } else if (path.endsWith('index.html') || path.endsWith('/')) {
    // We are on the index page
    const readEps = getReadEpisodes();
    if (readEps.length > 0) {
      readEps.forEach(ep => {
        const cardBody = document.querySelector(`.episode-card--ep${ep} .episode-card__body`);
        if (cardBody && !cardBody.querySelector('.read-badge')) {
          const badge = document.createElement('span');
          badge.className = 'read-badge';
          badge.textContent = '✓ 既読';
          cardBody.appendChild(badge);
        }
      });

      // Add "Resume Reading" button
      const maxEp = Math.max(...readEps);
      const nextEp = maxEp < 50 ? maxEp + 1 : maxEp;
      const heroContent = document.querySelector('.hero__content');
      if (heroContent && !document.querySelector('.resume-btn')) {
        const resumeBtn = document.createElement('a');
        resumeBtn.href = `episode${nextEp}.html`;
        resumeBtn.className = 'resume-btn';
        resumeBtn.innerHTML = `続きから読む (第${nextEp}話) →`;
        heroContent.insertBefore(resumeBtn, document.querySelector('.hero__scroll'));
      }
    }
  }

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

  // --- Swipe Navigation ---
  let touchstartX = 0;
  let touchendX = 0;

  function handleSwipe() {
    if (!match) return; // Only process on episode pages
    const currentEpNum = parseInt(match[1], 10);
    
    // Swipe Left (next episode)
    if (touchstartX - touchendX > 75) {
      if (currentEpNum < 50) {
        window.location.href = `episode${currentEpNum + 1}.html`;
      }
    }
    // Swipe Right (prev episode)
    if (touchendX - touchstartX > 75) {
      if (currentEpNum > 1) {
        window.location.href = `episode${currentEpNum - 1}.html`;
      } else {
        window.location.href = `index.html`; // Go back to index from ep1
      }
    }
  }

  document.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

})();
