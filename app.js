import pagesData from './pages-data.js';

document.addEventListener('DOMContentLoaded', function() {
  // Get all elements
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

  // Theme initialization
  const savedTheme = localStorage.getItem('theme') || 'light-mode';
  document.body.className = savedTheme;
  updateThemeIcon();

  themeToggle.addEventListener('click', function() {
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

  // Mobile menu handlers
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      sidebar.classList.add('active');
      mobileSidebarOverlay.classList.add('active');
    });
  }
  
  if (closeSidebar) {
    closeSidebar.addEventListener('click', function() {
      sidebar.classList.remove('active');
      mobileSidebarOverlay.classList.remove('active');
    });
  }
  
  if (mobileSidebarOverlay) {
    mobileSidebarOverlay.addEventListener('click', function() {
      sidebar.classList.remove('active');
      mobileSidebarOverlay.classList.remove('active');
    });
  }

  // Create book leaves (each leaf = 2 pages: front/back)
  const totalLeaves = Math.ceil(totalPages / 2);
  const leaves = [];

  for (let i = 0; i < totalLeaves; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'page-leaf';
    leaf.dataset.leafIndex = i;
    
    const frontPageIndex = i * 2;
    const frontPage = pagesData[frontPageIndex];
    const backPageIndex = i * 2 + 1;
    const backPage = backPageIndex < totalPages ? pagesData[backPageIndex] : null;

    // Front face (right page)
    const frontFace = document.createElement('div');
    frontFace.className = 'page-face front';
    frontFace.innerHTML = `
      <div class="page-header">
        <span>K-point E74 (২০২৬)</span>
        <span>পৃষ্ঠা ${frontPage.num}</span>
      </div>
      <div class="page-content" data-page="${frontPage.num}">
        ${frontPage.content}
      </div>
    `;
    leaf.appendChild(frontFace);

    // Back face (left page)
    const backFace = document.createElement('div');
    backFace.className = 'page-face back';
    
    if (backPage) {
      backFace.innerHTML = `
        <div class="page-header">
          <span>K-point E74 (২০২৬)</span>
          <span>পৃষ্ঠা ${backPage.num}</span>
        </div>
        <div class="page-content" data-page="${backPage.num}">
          ${backPage.content}
        </div>
      `;
    } else {
      backFace.innerHTML = `
        <div class="page-header">
          <span>K-point E74 (২০২৬)</span>
          <span>সমাপ্ত</span>
        </div>
        <div class="page-content" style="display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;">
          <i class="fa-solid fa-file-signature" style="font-size:48px;color:var(--color-primary);margin-bottom:16px;"></i>
          <h2 style="border:none;background:none;">সমাপ্ত</h2>
          <p style="color:var(--text-secondary);margin-top:8px;">দক্ষ কর্মী সিলেকশন প্ল্যান ২০২৬</p>
        </div>
      `;
    }
    leaf.appendChild(backFace);
    book3d.appendChild(leaf);
    leaves.push(leaf);
  }

  // Create Table of Contents
  pagesData.forEach(function(page) {
    const item = document.createElement('button');
    item.className = 'toc-item';
    item.dataset.page = page.num;
    
    const displayTitle = page.title.length > 28 ? page.title.substring(0, 26) + '...' : page.title;
    item.innerHTML = `
      <span class="toc-num">${page.num}</span>
      <span class="toc-title">${displayTitle}</span>
    `;
    
    item.addEventListener('click', function() {
      goToPage(page.num);
      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        mobileSidebarOverlay.classList.remove('active');
      }
    });
    
    tocList.appendChild(item);
  });

  // FIXED: Update book view for both mobile and desktop
  function updateBookView() {
    currentPageNum.textContent = currentPage;
    progressFill.style.width = (currentPage / totalPages * 100) + '%';
    
    // Check if mobile EVERY time
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // MOBILE: Show ONE page at a time (hide all leaves except current)
      leaves.forEach(function(leaf, idx) {
        const firstPage = idx * 2 + 1;
        const secondPage = idx * 2 + 2;
        
        if (currentPage === firstPage || currentPage === secondPage) {
          leaf.style.display = 'block';
          leaf.style.position = 'relative';
          leaf.style.width = '100%';
          leaf.style.transform = 'none';
          leaf.style.zIndex = '200';
        } else {
          leaf.style.display = 'none';
        }
      });
    } else {
      // DESKTOP: Show 2-page spread with 3D flip
      const currentLeafIndex = Math.floor((currentPage - 1) / 2);
      
      leaves.forEach(function(leaf, idx) {
        if (idx < currentLeafIndex) {
          // Flipped to the left
          leaf.className = 'page-leaf flipped';
          leaf.style.display = 'block';
          leaf.style.position = 'absolute';
          leaf.style.width = '50%';
          leaf.style.transform = 'rotateY(-180deg)';
          leaf.style.zIndex = 100 + idx;
        } else if (idx === currentLeafIndex) {
          // Current spread
          leaf.className = 'page-leaf active-leaf';
          leaf.style.display = 'block';
          leaf.style.position = 'absolute';
          leaf.style.width = '50%';
          leaf.style.transform = 'none';
          leaf.style.zIndex = 200;
        } else {
          // Not yet flipped
          leaf.className = 'page-leaf';
          leaf.style.display = 'block';
          leaf.style.position = 'absolute';
          leaf.style.width = '50%';
          leaf.style.transform = 'none';
          leaf.style.zIndex = 100 - idx;
        }
      });
    }

    // Update TOC active state
    document.querySelectorAll('.toc-item').forEach(function(item) {
      const isActive = parseInt(item.dataset.page) === currentPage;
      item.classList.toggle('active', isActive);
      if (isActive) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // Update button states
    prevPageBtn.disabled = currentPage === 1;
    firstPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    lastPageBtn.disabled = currentPage === totalPages;
  }

  function goToPage(pageNum) {
    pageNum = Math.max(1, Math.min(totalPages, pageNum));
    currentPage = pageNum;
    updateBookView();
  }

  function nextPage() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  // Button event listeners
  nextPageBtn.addEventListener('click', nextPage);
  prevPageBtn.addEventListener('click', prevPage);
  firstPageBtn.addEventListener('click', function() { goToPage(1); });
  lastPageBtn.addEventListener('click', function() { goToPage(totalPages); });

  // Keyboard navigation
  window.addEventListener('keydown', function(e) {
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

  // Touch swipe for Android
  let touchStartX = 0;
  
  book3d.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  book3d.addEventListener('touchend', function(e) {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextPage(); // Swiped left
      } else {
        prevPage(); // Swiped right
      }
    }
  }, { passive: true });

  // Search functionality
  searchInput.addEventListener('input', function() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length === 0) {
      clearSearch.style.display = 'none';
      searchResults.style.display = 'none';
      return;
    }

    clearSearch.style.display = 'block';
    searchResults.style.display = 'flex';
    searchResults.innerHTML = '';

    const matches = [];
    
    pagesData.forEach(function(page) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = page.content;
      const text = tempDiv.textContent || '';
      
      if (text.toLowerCase().includes(query)) {
        const index = text.toLowerCase().indexOf(query);
        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + query.length + 30);
        let snippet = text.substring(start, end);
        
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        
        matches.push({
          pageNum: page.num,
          title: page.title,
          snippet: snippet
        });
      }
    });

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-item" style="text-align:center;color:var(--text-muted);">কোনো ফলাফল পাওয়া যায়নি</div>';
    } else {
      matches.forEach(function(match) {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.innerHTML = `
          <div class="match-title">পৃষ্ঠা ${match.pageNum} - ${match.title}</div>
          <div class="match-snippet">${match.snippet}</div>
        `;
        item.addEventListener('click', function() {
          goToPage(match.pageNum);
          searchResults.style.display = 'none';
        });
        searchResults.appendChild(item);
      });
    }
  });

  clearSearch.addEventListener('click', function() {
    searchInput.value = '';
    clearSearch.style.display = 'none';
    searchResults.style.display = 'none';
  });

  // Handle window resize (desktop ↔ mobile)
  window.addEventListener('resize', function() {
    updateBookView();
  });

  // Initial render
  updateBookView();
});
