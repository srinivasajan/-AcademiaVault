// Function to show selected semester with smooth transition
function showSemester(semesterNumber) {
    // Hide all semester panels
    const allPanels = document.querySelectorAll('.semester-panel');
    allPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.style.opacity = '0';
    });

    // Remove active class from all tabs
    const allTabs = document.querySelectorAll('.tab-button');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected semester panel with fade-in effect
    const selectedPanel = document.getElementById('sem' + semesterNumber);
    if (selectedPanel) {
        setTimeout(() => {
            selectedPanel.classList.add('active');
            selectedPanel.style.opacity = '1';
        }, 100);
    }

    // Add active class to selected tab
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons[semesterNumber - 1]) {
        tabButtons[semesterNumber - 1].classList.add('active');
    }

    // Smooth scroll to semester content
    const semesterContent = document.querySelector('.semester-content');
    if (semesterContent) {
        semesterContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Store current semester in localStorage
    localStorage.setItem('currentSemester', semesterNumber);

    // Add haptic feedback (if supported)
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

// Initialize: Show Semester 5 by default or last viewed semester
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has a saved semester preference
    const savedSemester = localStorage.getItem('currentSemester');
    const defaultSemester = savedSemester ? parseInt(savedSemester) : 5;
    
    showSemester(defaultSemester);
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(event) {
        const currentActive = document.querySelector('.tab-button.active');
        if (!currentActive) return;
        
        const allTabs = Array.from(document.querySelectorAll('.tab-button'));
        const currentIndex = allTabs.indexOf(currentActive);
        
        if (event.key === 'ArrowRight' && currentIndex < allTabs.length - 1) {
            showSemester(currentIndex + 2);
        } else if (event.key === 'ArrowLeft' && currentIndex > 0) {
            showSemester(currentIndex);
        }
    });

    // Add scroll-to-top button
    createScrollToTopButton();

    // Add intersection observer for card animations
    animateCardsOnScroll();

    // Add ripple effect to cards
    addRippleEffect();

    // Track card hover time for analytics
    trackCardInteractions();

    // Add loading state handling
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Create scroll-to-top button
function createScrollToTopButton() {
    const scrollBtn = document.createElement('div');
    scrollBtn.className = 'scroll-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollBtn);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Animate cards when they come into view
function animateCardsOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                    entry.target.style.opacity = '1';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    const cards = document.querySelectorAll('.subject-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
}

// Add ripple effect to clickable cards
function addRippleEffect() {
    const cards = document.querySelectorAll('.subject-card:not(.placeholder)');
    
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            const rippleContainer = document.createElement('span');
            rippleContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                pointer-events: none;
            `;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(102, 126, 234, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            `;
            
            rippleContainer.appendChild(ripple);
            this.appendChild(rippleContainer);
            
            setTimeout(() => {
                rippleContainer.remove();
            }, 600);
        });
    });

    // Add ripple animation to stylesheet
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Track card interactions
function trackCardInteractions() {
    const cards = document.querySelectorAll('.subject-card:not(.placeholder)');
    
    cards.forEach(card => {
        let hoverStartTime;
        
        card.addEventListener('mouseenter', function() {
            hoverStartTime = Date.now();
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        card.addEventListener('mouseleave', function() {
            const hoverDuration = Date.now() - hoverStartTime;
            console.log(`Hovered for ${hoverDuration}ms on: ${this.querySelector('h3').textContent}`);
        });
        
        card.addEventListener('click', function(e) {
            const subjectName = this.querySelector('h3').textContent;
            const subjectCode = this.querySelector('.subject-code').textContent;
            
            console.log(`📚 Opening ${subjectCode}: ${subjectName}`);
            
            // Visual feedback
            this.style.transform = 'translateY(-8px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
}

// Add smooth scrolling for all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

// All searchable data
const searchableData = [];

// Initialize search data from DOM
function initSearchData() {
    const subjectCards = document.querySelectorAll('.subject-card:not(.placeholder)');
    
    subjectCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent || '';
        const code = card.querySelector('.subject-code')?.textContent || '';
        const semester = card.getAttribute('data-semester') || '';
        const searchTerms = card.getAttribute('data-subject') || '';
        const icon = card.querySelector('.subject-icon')?.textContent || '📚';
        const url = card.href;
        
        searchableData.push({
            title,
            code,
            semester,
            searchTerms: `${title} ${code} ${searchTerms} semester ${semester}`.toLowerCase(),
            icon,
            url,
            element: card
        });
    });
}

// Search function
function performSearch(query) {
    const searchResults = document.getElementById('searchResults');
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
        searchResults.style.display = 'none';
        return;
    }
    
    const results = searchableData.filter(item => 
        item.searchTerms.includes(normalizedQuery)
    );
    
    displaySearchResults(results, normalizedQuery);
}

// Display search results
function displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                <div class="search-no-results-icon">🔍</div>
                <p>No results found for "${query}"</p>
                <p style="font-size: 0.85rem; margin-top: 8px;">Try searching for subject names, codes, or semester numbers</p>
            </div>
        `;
        searchResults.style.display = 'block';
        return;
    }
    
    let html = '';
    results.forEach(result => {
        html += `
            <div class="search-result-item" onclick="navigateToResult('${result.url}', ${result.semester})">
                <div class="search-result-icon">${result.icon}</div>
                <div class="search-result-content">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-meta">${result.code} • Semester ${result.semester}</div>
                </div>
            </div>
        `;
    });
    
    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
}

// Navigate to search result
function navigateToResult(url, semester) {
    // First show the semester
    showSemester(parseInt(semester));
    
    // Close search results
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').style.display = 'none';
    
    // Scroll to the semester content
    setTimeout(() => {
        const semesterContent = document.querySelector('.semester-content');
        if (semesterContent) {
            semesterContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);
}

// Show all semesters (overview)
function showAllSemesters() {
    // Show semester 5 by default when "All" is clicked
    showSemester(5);
    const semesterTabs = document.querySelector('.semester-tabs');
    if (semesterTabs) {
        semesterTabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput) return;
    
    // Initialize search data
    initSearchData();
    
    // Search input event
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        
        if (query.length > 0) {
            clearSearch.style.display = 'block';
            performSearch(query);
        } else {
            clearSearch.style.display = 'none';
            searchResults.style.display = 'none';
        }
    });
    
    // Clear search
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        searchResults.style.display = 'none';
        searchInput.focus();
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Escape to close search
        if (e.key === 'Escape') {
            searchInput.blur();
            searchResults.style.display = 'none';
        }
    });
}

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}