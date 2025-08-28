'use strict';

/**
 * navbar toggle
 */

const overlay = document.querySelector("[data-overlay]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navLinks = document.querySelectorAll("[data-nav-link]");

const navElemArr = [navOpenBtn, navCloseBtn, overlay];

const navToggleEvent = function (elem) {
  for (let i = 0; i < elem.length; i++) {
    elem[i].addEventListener("click", function () {
      navbar.classList.toggle("active");
      overlay.classList.toggle("active");
    });
  }
}

navToggleEvent(navElemArr);
navToggleEvent(navLinks);

/**
 * header sticky & go to top
 */

const header = document.querySelector("[data-header]");
const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 200) {
    header.classList.add("active");
    goTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    goTopBtn.classList.remove("active");
  }
});

/**
 * Smooth scrolling for navigation links
 */
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

/**
 * Intersection Observer for animations
 */
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
  const animateElements = document.querySelectorAll('.popular-card, .package-card, .gallery-item');
  animateElements.forEach(el => observer.observe(el));
});

/**
 * Enhanced form interactions
 */
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.querySelector('.tour-search-form');
  if (searchForm) {
    const inputs = searchForm.querySelectorAll('.input-field');
    
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', function() {
        if (!this.value) {
          this.parentElement.classList.remove('focused');
        }
      });
    });
    
    // Form submission with validation
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Add loading state
      const submitBtn = this.querySelector('.search-btn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Searching...';
      submitBtn.disabled = true;
      
      // Simulate search (replace with actual API call)
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showNotification('Search completed! Check your results below.', 'success');
      }, 2000);
    });
  }
});

/**
 * Notification system
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <ion-icon name="${type === 'success' ? 'checkmark-circle' : 'information-circle'}"></ion-icon>
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
  
  // Close button functionality
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  });
}

/**
 * Parallax effect for hero section
 */
window.addEventListener('scroll', function() {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');
  const videoBg = document.querySelector('.hero-video-bg');
  
  if (hero && videoBg) {
    const rate = scrolled * -0.5;
    videoBg.style.transform = `translateY(${rate}px)`;
  }
});

/**
 * Site-wide search overlay and client-side filtering
 */
document.addEventListener('DOMContentLoaded', function() {
  const openBtn = document.querySelector('[data-search-open]');
  const closeBtn = document.querySelector('[data-search-close]');
  const overlay = document.querySelector('[data-search-overlay]');
  const input = document.getElementById('site-search-input');
  const results = document.getElementById('site-search-results');

  function openSearch() {
    if (!overlay) return;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => input && input.focus(), 50);
  }
  function closeSearch() {
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    results && (results.innerHTML = '');
    // remove highlights
    document.querySelectorAll('.search-highlight').forEach(el => el.classList.remove('search-highlight'));
  }

  openBtn && openBtn.addEventListener('click', openSearch);
  closeBtn && closeBtn.addEventListener('click', closeSearch);
  overlay && overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });

  // Collect searchable items from DOM
  function collectItems() {
    const items = [];
    // Popular Destinations
    document.querySelectorAll('.popular-card').forEach(card => {
      const title = (card.querySelector('.card-title a')?.textContent || '').trim();
      const region = (card.querySelector('.card-subtitle a')?.textContent || '').trim();
      items.push({ type: 'Destination', title, region, element: card, url: '#destination' });
    });
    // Packages
    document.querySelectorAll('.package-card').forEach(card => {
      const title = (card.querySelector('.card-title')?.textContent || '').trim();
      const meta = Array.from(card.querySelectorAll('.card-meta-list .text')).map(t => t.textContent.trim()).join(' • ');
      items.push({ type: 'Package', title, region: meta, element: card, url: '#package' });
    });
    // Gallery
    document.querySelectorAll('.gallery-item').forEach(card => {
      const alt = (card.querySelector('img')?.alt || 'Gallery image').trim();
      items.push({ type: 'Gallery', title: alt, region: '', element: card, url: '#gallery' });
    });
    return items;
  }

  const searchableItems = collectItems();

  function renderResults(matches) {
    if (!results) return;
    results.innerHTML = '';
    if (!matches.length) {
      results.innerHTML = '<div class="search-result-item"><span>No results found</span></div>';
      return;
    }
    matches.slice(0, 12).forEach(m => {
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.innerHTML = `<div><strong>${m.title}</strong><div class="meta">${m.type}${m.region ? ' • ' + m.region : ''}</div></div><a class="btn btn-primary" href="${m.url}">View</a>`;
      div.addEventListener('click', () => {
        closeSearch();
        // highlight
        document.querySelectorAll('.search-highlight').forEach(el => el.classList.remove('search-highlight'));
        m.element && m.element.classList.add('search-highlight');
        const section = document.querySelector(m.url);
        section && section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      results.appendChild(div);
    });
  }

  function filterItems(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchableItems.filter(it => (it.title + ' ' + it.region).toLowerCase().includes(q));
  }

  input && input.addEventListener('input', function() {
    const matches = filterItems(this.value);
    renderResults(matches);
  });
});