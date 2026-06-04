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

  // Android: Prevent double-tap zoom
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

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
          <p style="color: var(--text-secondary); margin-top: 8px;">কোরিয়া আইন মন্ত্রণালয়</p>
        </div>
      `;
    }
    leaf.appendChild(backFace);
    book3d.appendChild(leaf);
    leaves.push(leaf);
  }

  // Generate TOC
  pagesData.forEach((page) => {
    const item = document.createElement('button');
    item.className = 'toc-item';
    item.dataset.page = page.num;
    
    let displayTitle = page.title.length > 28 ? page.title.substring(0, 26) + '...' : page.title;
    
    item.innerHTML = `
      <span class="toc-num">${page.num}</span>
      <span class="toc-title">${displayTitle}</span>
    `;
    
    item.addEventListener('click', () => {
      goToPage(page.num);
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        mobileSidebarOverlay.classList.remove('active');
      }
    });
    
    tocList.appendChild(item);
  });

  function updateBookView() {
    currentPageNum.textContent = currentPage;
    progressFill.style.width = `${(currentPage / totalPages) * 100}%`;
    
    const activeLeafIdx = currentPage === 1 ? 0 : Math.floor((currentPage - 2) / 2) + 1;

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

    document.querySelectorAll('.toc-item').forEach(item => {
      if (parseInt(item.dataset.page) === currentPage) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });

    prevPageBtn.disabled = currentPage === 1;
    firstPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    lastPageBtn.disabled = currentPage === totalPages;
  }

  function goToPage(page) {
    page = Math.max(1, Math.min(totalPages, page));
    currentPage = page;
    updateBookView();
  }

  function nextPage() {
    if (currentPage === 1) {
      goToPage(2);
    } else {
      goToPage(currentPage + 2 - (currentPage % 2));
    }
  }

  function prevPage() {
    if (currentPage <= 3) {
      goToPage(1);
    } else {
      goToPage(currentPage - 2 + (currentPage % 2));
    }
  }

  nextPageBtn.addEventListener('click', nextPage);
  prevPageBtn.addEventListener('click', prevPage);
  firstPageBtn.addEventListener('click', () => goToPage(1));
  lastPageBtn.addEventListener('click', () => goToPage(totalPages));

  window.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') nextPage();
    else if (e.key === 'ArrowLeft') prevPage();
    else if (e.key === 'Home') goToPage(1);
    else if (e.key === 'End') goToPage(totalPages);
  });

  // Enhanced Android Touch Swipe
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  
  book3d.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  book3d.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const xDiff = touchStartX - touchEndX;
    const yDiff = touchStartY - touchEndY;
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > swipeThreshold) {
        nextPage();
      } else if (xDiff < -swipeThreshold) {
        prevPage();
      }
    }
  }

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
      
      if (text.toLowerCase().includes(query)) {
        const index = text.toLowerCase().indexOf(query);
        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + query.length + 30);
        let snippet = text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        
        const regex = new RegExp(`(${query})`, 'gi');
        snippet = snippet.replace(regex, '<mark>$1</mark>');

        matches.push({ pageNum: page.num, title: page.title, snippet });
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

  updateBookView();
});
