// Premium K-point E-7-4 Book App Logic
import pagesData from './pages-data.js';

document.addEventListener('DOMContentLoaded', () => {
  const book3d = document.getElementById('book3d');
  const tocList = document.getElementById('tocList');
  const currentPageNum = document.getElementById('currentPageNum');
  const totalPageNum = document.getElementById('totalPageNum');
  const progressFill = document.getElementById('progressFill');
  const themeToggle = document.getElementById('themeToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
  const closeSidebar = document.getElementById('closeSidebar');
  
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const firstPageBtn = document.getElementById('firstPageBtn');
  const lastPageBtn = document.getElementById('lastPageBtn');
  
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  const searchResults = document.getElementById('searchResults');

  let currentPage = 1;
  const totalPages = pagesData.length;
  totalPageNum.textContent = totalPages;

  // Initialize Theme
  const savedTheme = localStorage.getItem('theme') || 'light-mode';
  document.body.className = savedTheme;
  updateThemeIcon();

  themeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('light-mode')) {
      document.body.className = 'dark-mode';
      localStorage.setItem('theme', 'dark-mode');
    } else {
      document.body.className = 'light-mode';
      localStorage.setItem('theme', 'light-mode');
    }
    updateThemeIcon();
  });

  function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }

  // Mobile menu toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.add('active');
      mobileSidebarOverlay.classList.add('active');
    });
  }

  if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
      sidebar.classList.remove('active');
      mobileSidebarOverlay.classList.remove('active');
    });
  }

  if (mobileSidebarOverlay) {
    mobileSidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      mobileSidebarOverlay.classList.remove('active');
    });
  }

  // Generate 3D Leaf Nodes
  const totalLeaves = Math.ceil(totalPages / 2);
  const leaves = [];

  for (let i = 0; i < totalLeaves; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'page-leaf';
    leaf.dataset.leafIndex = i;
    
    const frontPageIdx = 2 * i;
    const frontPageData = pagesData[frontPageIdx];
    
    const backPageIdx = 2 * i + 1;
    const backPageData = backPageIdx < totalPages ? pagesData[backPageIdx] : null;

    // Create Front Face
    const frontFace = document.createElement('div');
    frontFace.className = 'page-face front';
    frontFace.innerHTML = `
      <div class="page-header">
        <span>K-point E74 (২০২৬)</span>
        <span>পৃষ্ঠা ${frontPageData.num}</span>
      </div>
      <div class="page-content" data-page="${frontPageData.num}">
        ${frontPageData.content}
      </div>
    `;
    leaf.appendChild(frontFace);

    // Create Back Face
    const backFace = document.createElement('div');
    backFace.className = 'page-face back';
    if (backPageData) {
      backFace.innerHTML = `
        <div class="page-header">
          <span>K-point E74 (২০২৬)</span>
          <span>পৃষ্ঠা ${backPageData.num}</span>
        </div>
        <div class="page-content" data-page="${backPageData.num}">
          ${backPageData.content}
        </div>
      `;
    } else {
      backFace.innerHTML = `
        <div class="page-header">
          <span>K-point E74 (২০২৬)</span>
          <span>সমাপ্ত</span>
        </div>
        <div class="page-content" style="display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center;">
          <i class="fa-solid fa-file-signature" style="font-size: 48px; color: var(--color-primary); margin-bottom: 16px;"></i>
          <h2 style="border:none; background:none;">দক্ষ কর্মী সিলেকশন প্ল্যান ২০২৬</h2>
          <p style="color: var(--text-secondary); margin-top: 8px;">কোরিয়া আইন মন্ত্রণালয় কর্তৃক প্রকাশিত</p>
        </div>
      `;
    }
    leaf.appendChild(backFace);
    book3d.appendChild(leaf);
    leaves.push(leaf);
  }

  // Generate Table of Contents (TOC) - FIXED
  pagesData.forEach((page) => {
    const item = document.createElement('button');
    item.className = 'toc-item';
    item.dataset.page = page.num;
    
    let displayTitle = page.title;
    if (displayTitle.length > 28) {
      displayTitle = displayTitle.substring(0, 26) + '...';
    }
    
    item.innerHTML = `
      <span class="toc-num">${page.num}</span>
      <span class="toc-title">${displayTitle}</span>
    `;
    
    // FIXED: Click handler for TOC
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const pageNum = parseInt(item.dataset.page);
      console.log('TOC clicked, going to page:', pageNum);
      goToPage(pageNum);
      
      // Close sidebar on mobile after selection
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        mobileSidebarOverlay.classList.remove('active');
      }
    });
    
    tocList.appendChild(item);
  });

  // Navigation Logic - FIXED
  function updateBookView() {
    currentPageNum.textContent = currentPage;
    progressFill.style.width = `${(currentPage / totalPages) * 100}%`;
    
    // FIXED: Correct leaf calculation for page spread
    const activeLeafIdx = currentPage === 1 ? 0 : Math.floor((currentPage - 1) / 2);

    leaves.forEach((leaf, idx) => {
      const isLeftPage = idx === activeLeafIdx - 1;
      const isRightPage = idx === activeLeafIdx;
      const pointerClass = (isLeftPage || isRightPage) ? ' active-leaf' : '';

      if (idx < activeLeafIdx) {
        leaf.className = 'page-leaf flipped' + pointerClass;
        leaf.style.zIndex = 100 + idx;
      } else if (idx === activeLeafIdx) {
        leaf.className = 'page-leaf active-leaf';
        leaf.style.zIndex = 200;
      } else {
        leaf.className = 'page-leaf' + pointerClass;
        leaf.style.zIndex = 100 - idx;
      }
    });

    // Update TOC active state
    document.querySelectorAll('.toc-item').forEach(item => {
      if (parseInt(item.dataset.page) === currentPage) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });

    // Disable/Enable buttons
    prevPageBtn.disabled = currentPage === 1;
    firstPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    lastPageBtn.disabled = currentPage === totalPages;
  }

  function goToPage(page) {
    page = Math.max(1, Math.min(totalPages, page));
    console.log('goToPage called:', page, 'currentPage was:', currentPage);
    currentPage = page;
    updateBookView();
  }

  function nextPage() {
    if (currentPage === totalPages) return;
    goToPage(currentPage + 1);
  }

  function prevPage() {
    if (currentPage === 1) return;
    goToPage(currentPage - 1);
  }

  // Click Event Listeners - FIXED
  nextPageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    nextPage();
  });
  
  prevPageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    prevPage();
  });
  
  firstPageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    goToPage(1);
  });
  
  lastPageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    goToPage(totalPages);
  });

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') {
      nextPage();
    } else if (e.key === 'ArrowLeft') {
      prevPage();
    } else if (e.key === 'Home') {
      goToPage(1);
    } else if (e.key === 'End') {
      goToPage(totalPages);
    }
  });

  // Android Touch Swipe - FIXED for better responsiveness
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  
  book3d.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    touchStartTime = Date.now();
  }, { passive: true });
  
  book3d.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const touchEndTime = Date.now();
    
    const xDiff = touchStartX - touchEndX;
    const yDiff = touchStartY - touchEndY;
    const timeDiff = touchEndTime - touchStartTime;
    
    // Only trigger swipe if quick enough (< 300ms) and horizontal movement > vertical
    if (timeDiff < 300 && Math.abs(xDiff) > Math.abs(yDiff)) {
      const swipeThreshold = 40; // Lowered for Android
      
      if (xDiff > swipeThreshold) {
        // Swiped left -> Next page
        nextPage();
      } else if (xDiff < -swipeThreshold) {
        // Swiped right -> Prev page
        prevPage();
      }
    }
  }, { passive: true });

  // Android: Tap on page edges to navigate
  book3d.addEventListener('click', (e) => {
    const rect = book3d.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    // Left 25% = previous, Right 25% = next
    if (clickX < width * 0.25) {
      prevPage();
    } else if (clickX > width * 0.75) {
      nextPage();
    }
  });

  // Search Logic
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length === 0) {
      clearSearch.style.display = 'none';
      searchResults.style.display = 'none';
      clearHighlights();
      return;
    }

    clearSearch.style.display = 'block';
    searchResults.style.display = 'flex';
    searchResults.innerHTML = '';

    let matches = [];

    pagesData.forEach(page => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = page.content;
      const text = tempDiv.textContent || tempDiv.innerText || '';
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes(query)) {
        const index = lowerText.indexOf(query);
        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + query.length + 30);
        let snippet = text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        
        const regex = new RegExp(`(${query})`, 'gi');
        snippet = snippet.replace(regex, '<mark>$1</mark>');

        matches.push({
          pageNum: page.num,
          title: page.title,
          snippet: snippet
        });
      }
    });

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-item" style="cursor:default; text-align:center; color:var(--text-muted);">কোনো ফলাফল পাওয়া যায়নি</div>';
    } else {
      matches.forEach(match => {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.innerHTML = `
          <div class="match-title">পৃষ্ঠা ${match.pageNum} - ${match.title}</div>
          <div class="match-snippet">${match.snippet}</div>
        `;
        item.addEventListener('click', () => {
          goToPage(match.pageNum);
          highlightTextOnPage(match.pageNum, query);
          searchResults.style.display = 'none';
        });
        searchResults.appendChild(item);
      });
    }
  });

  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.style.display = 'none';
    searchResults.style.display = 'none';
    clearHighlights();
  });

  function highlightTextOnPage(pageNum, query) {
    clearHighlights();
    
    const pageContentEl = document.querySelector(`.page-content[data-page="${pageNum}"]`);
    if (!pageContentEl) return;

    if (!pageContentEl.dataset.originalHtml) {
      pageContentEl.dataset.originalHtml = pageContentEl.innerHTML;
    }

    const regex = new RegExp(`(${query})`, 'gi');
    
    const walk = document.createTreeWalker(pageContentEl, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while (node = walk.nextNode()) {
      if (node.nodeValue.toLowerCase().includes(query)) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(node => {
      const parent = node.parentNode;
      if (parent.tagName === 'MARK' || parent.closest('style') || parent.closest('script')) return;
      
      const span = document.createElement('span');
      span.innerHTML = node.nodeValue.replace(regex, '<mark style="background-color: #ffeb3b; color: #000; border-radius: 2px; padding: 0 2px;">$1</mark>');
      parent.replaceChild(span, node);
    });
  }

  function clearHighlights() {
    document.querySelectorAll('.page-content[data-original-html]').forEach(el => {
      el.innerHTML = el.dataset.originalHtml;
      delete el.dataset.originalHtml;
    });
  }

  // Initial render
  updateBookView();
});
