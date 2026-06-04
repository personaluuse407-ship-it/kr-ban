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

  // Theme
  const savedTheme = localStorage.getItem('theme') || 'light-mode';
  document.body.className = savedTheme;
  updateThemeIcon();

  themeToggle.addEventListener('click', () => {
    document.body.className = document.body.classList.contains('light-mode') 
      ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', document.body.className);
    updateThemeIcon();
  });

  function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }

  // Mobile menu
  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    mobileSidebarOverlay.classList.add('active');
  });
  if (closeSidebar) closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('active');
    mobileSidebarOverlay.classList.remove('active');
  });
  if (mobileSidebarOverlay) mobileSidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    mobileSidebarOverlay.classList.remove('active');
  });

  // Generate leaves - each leaf = 2 pages spread (LEFT page on back, RIGHT page on front)
  const totalLeaves = Math.ceil(totalPages / 2);
  const leaves = [];

  for (let i = 0; i < totalLeaves; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'page-leaf';
    leaf.dataset.leafIndex = i;
    
    // Leaf 0: front=page1, back=page2
    // Leaf 1: front=page3, back=page4
    // etc.
    const frontPageIdx = i * 2;
    const frontPageData = pagesData[frontPageIdx];
    const backPageIdx = i * 2 + 1;
    const backPageData = backPageIdx < totalPages ? pagesData[backPageIdx] : null;

    // Front face (shows on RIGHT side when leaf is unflipped)
    const frontFace = document.createElement('div');
    frontFace.className = 'page-face front';
    frontFace.innerHTML = `
      <div class="page-header">
        <span>K-point E74 (২০২৬)</span>
        <span>পৃষ্ঠা ${frontPageData.num}</span>
      </div>
      <div class="page-content" data-page="${frontPageData.num}">${frontPageData.content}</div>
    `;
    leaf.appendChild(frontFace);

    // Back face (shows on LEFT side when leaf is flipped)
    const backFace = document.createElement('div');
    backFace.className = 'page-face back';
    backFace.innerHTML = backPageData ? `
      <div class="page-header">
        <span>K-point E74 (২০২৬)</span>
        <span>পৃষ্ঠা ${backPageData.num}</span>
      </div>
      <div class="page-content" data-page="${backPageData.num}">${backPageData.content}</div>
    ` : `
      <div class="page-header"><span>K-point E74 (২০২৬)</span><span>সমাপ্ত</span></div>
      <div class="page-content" style="display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;">
        <i class="fa-solid fa-file-signature" style="font-size:48px;color:var(--color-primary);margin-bottom:16px;"></i>
        <h2 style="border:none;background:none;">সমাপ্ত</h2>
      </div>
    `;
    leaf.appendChild(backFace);
    book3d.appendChild(leaf);
    leaves.push(leaf);
  }

  // Generate TOC
  pagesData.forEach((page) => {
    const item = document.createElement('button');
    item.className = 'toc-item';
    item.dataset.page = page.num;
    const displayTitle = page.title.length > 28 ? page.title.substring(0, 26) + '...' : page.title;
    item.innerHTML = `<span class="toc-num">${page.num}</span><span class="toc-title">${displayTitle}</span>`;
    
    item.addEventListener('click', () => {
      goToPage(page.num);
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        mobileSidebarOverlay.classList.remove('active');
      }
    });
    
    tocList.appendChild(item);
  });

  // FIXED: Correct spread logic for desktop (2 pages), single page for mobile
  function updateBookView() {
    currentPageNum.textContent = currentPage;
    progressFill.style.width = `${(currentPage / totalPages) * 100}%`;
    
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // MOBILE: Show one page at a time
      leaves.forEach((leaf, idx) => {
        const frontPageNum = idx * 2 + 1;
        const backPageNum = idx * 2 + 2;
        
        // This leaf shows current page?
        const showsCurrentPage = (frontPageNum === currentPage) || (backPageNum === currentPage);
        
        if (showsCurrentPage) {
          leaf.className = 'page-leaf active-leaf';
          leaf.style.zIndex = 200;
        } else {
          leaf.className = 'page-leaf';
          leaf.style.zIndex = 100 - idx;
        }
      });
    } else {
      // DESKTOP: Show 2-page spread
      // Leaf 0 shows pages 1-2, Leaf 1 shows pages 3-4, etc.
      const currentLeafIndex = Math.floor((currentPage - 1) / 2);

      leaves.forEach((leaf, idx) => {
        if (idx < currentLeafIndex) {
          leaf.className = 'page-leaf flipped';
          leaf.style.zIndex = 100 + idx;
        } else if (idx === currentLeafIndex) {
          leaf.className = 'page-leaf active-leaf';
          leaf.style.zIndex = 200;
        } else {
          leaf.className = 'page-leaf';
          leaf.style.zIndex = 100 - idx;
        }
      });
    }

    // Update TOC active state
    document.querySelectorAll('.toc-item').forEach(item => {
      const isActive = parseInt(item.dataset.page) === currentPage;
      item.classList.toggle('active', isActive);
      if (isActive) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    prevPageBtn.disabled = currentPage === 1;
    firstPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    lastPageBtn.disabled = currentPage === totalPages;
  }

  function goToPage(page) {
    currentPage = Math.max(1, Math.min(totalPages, page));
    updateBookView();
  }

  function nextPage() {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  }

  function prevPage() {
    if (currentPage > 1) goToPage(currentPage - 1);
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

  // Touch swipe for Android
  let touchStartX = 0;
  book3d.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  book3d.addEventListener('touchend', e => {
    const xDiff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(xDiff) > 40) {
      xDiff > 0 ? nextPage() : prevPage();
    }
  }, { passive: true });

  // Search
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      clearSearch.style.display = 'none';
      searchResults.style.display = 'none';
      return;
    }

    clearSearch.style.display = 'block';
    searchResults.style.display = 'flex';
    searchResults.innerHTML = '';

    const matches = [];
    pagesData.forEach(page => {
      const temp = document.createElement('div');
      temp.innerHTML = page.content;
      const text = temp.textContent || '';
      if (text.toLowerCase().includes(query)) {
        const idx = text.toLowerCase().indexOf(query);
        const start = Math.max(0, idx - 20);
        const end = Math.min(text.length, idx + query.length + 30);
        let snippet = text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        matches.push({ pageNum: page.num, title: page.title, snippet });
      }
    });

    searchResults.innerHTML = matches.length 
      ? matches.map(m => `
        <div class="search-item" data-page="${m.pageNum}">
          <div class="match-title">পৃষ্ঠা ${m.pageNum} - ${m.title}</div>
          <div class="match-snippet">${m.snippet}</div>
        </div>`).join('')
      : '<div class="search-item" style="text-align:center;color:var(--text-muted);">কোনো ফলাফল পাওয়া যায়নি</div>';

    searchResults.querySelectorAll('.search-item[data-page]').forEach(item => {
      item.addEventListener('click', () => goToPage(parseInt(item.dataset.page)));
    });
  });

  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.style.display = 'none';
    searchResults.style.display = 'none';
  });

  // Handle window resize (desktop ↔ mobile)
  window.addEventListener('resize', () => {
    updateBookView();
  });

  updateBookView();
});
