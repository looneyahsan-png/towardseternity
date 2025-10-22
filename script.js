/* ===== GLOBAL VARIABLES & CONFIGURATION ===== */
const CONFIG = {
  // YouTube API Configuration
  YOUTUBE_API_KEY: 'YOUR_YOUTUBE_API_KEY', // Replace with actual API key
  CHANNEL_ID: 'UCPubBVDCzu7IWWnitlkEsNw',
  
  // Video Categories and Playlists
  PLAYLISTS: {
    converts: 'PLlZazEh_c4nQAuNEK529I8ej-CCjPlfMN',
    whyIslam: 'PLlZazEh_c4nTyizfj9luw1eEzXBRPKJqS',
    womenInIslam: 'PLlZazEh_c4nRRk7xNki84lEqqedbaSq8G',
    islamicTalks: 'PLlZazEh_c4nRttS_-ztbW8LIMzZ6q-qIQ',
    comparativeReligion: 'PLlZazEh_c4nSsKlx06Cef3U1QlCV44Mz3',
    prophetStories: 'PLlZazEh_c4nR3BNsJmpuSC84YyrPRBgv9'
  },
  
  // Popular Video IDs for quick access
  FEATURED_VIDEOS: {
    islamVsChristianity: [
      'yXCMU72z0Ms', // While Writing Anti-Islam Book He Became Muslim
      'Vhqz7KA5mI0', // Bible's Moses VS Quran's Moses
      'IP5HLml6sH8', // A Jew Converts to Islam After 60 Years
      '-Jrmp0XON7I'  // A Priest Converts to Islam
    ],
    whyIslam: [
      'Zu_344iByfs', // 7 Future Technologies in the Qur'an
      'V59hIPdkoX0', // Islam Ended Racism 1400 Years Ago
      'LOjDlcA3DkA', // Why Is a Good Non-Muslim Punished Forever
      'hLSUwWWkE68'  // Why Islam Made ZAKAT Obligatory
    ]
  },
  
  // Animation settings
  ANIMATION_DURATION: 300,
  SCROLL_OFFSET: 100
};

/* ===== UTILITY FUNCTIONS ===== */
const Utils = {
  // DOM manipulation helpers
  $(selector) {
    return document.querySelector(selector);
  },
  
  $$(selector) {
    return document.querySelectorAll(selector);
  },
  
  // Debounce function for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Format numbers (e.g., 1000 -> 1K)
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },
  
  // Format duration (seconds to MM:SS)
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },
  
  // Get current page name
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    return page;
  },
  
  // Smooth scroll to element
  scrollTo(element, offset = 0) {
    const targetPosition = element.offsetTop - offset;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
};

/* ===== NAVIGATION FUNCTIONALITY ===== */
const Navigation = {
  init() {
    this.setupMobileMenu();
    this.setupScrollEffects();
    this.setupActiveLinks();
    this.setupDropdowns();
  },
  
  setupMobileMenu() {
    const mobileToggle = Utils.$('.mobile-toggle');
    const navMenu = Utils.$('.nav-menu');
    
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
          mobileToggle.classList.remove('active');
          navMenu.classList.remove('active');
          document.body.classList.remove('menu-open');
        }
      });
      
      // Close menu when clicking on nav links
      Utils.$$('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          mobileToggle.classList.remove('active');
          navMenu.classList.remove('active');
          document.body.classList.remove('menu-open');
        });
      });
    }
  },
  
  setupScrollEffects() {
    const header = Utils.$('.header');
    
    if (header) {
      const handleScroll = Utils.throttle(() => {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }, 100);
      
      window.addEventListener('scroll', handleScroll);
    }
  },
  
  setupActiveLinks() {
    const currentPage = Utils.getCurrentPage();
    const navLinks = Utils.$$('.nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const linkPage = href.replace('.html', '').replace('./', '');
        if (linkPage === currentPage || (currentPage === 'index' && linkPage === '')) {
          link.classList.add('active');
        }
      }
    });
  },
  
  setupDropdowns() {
    const dropdowns = Utils.$$('.dropdown');
    
    dropdowns.forEach(dropdown => {
      const menu = dropdown.querySelector('.dropdown-menu');
      
      dropdown.addEventListener('mouseenter', () => {
        menu.style.display = 'block';
        setTimeout(() => {
          menu.style.opacity = '1';
          menu.style.visibility = 'visible';
          menu.style.transform = 'translateY(0)';
        }, 10);
      });
      
      dropdown.addEventListener('mouseleave', () => {
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
        menu.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          menu.style.display = 'none';
        }, CONFIG.ANIMATION_DURATION);
      });
    });
  }
};

/* ===== YOUTUBE API INTEGRATION ===== */
const YouTubeAPI = {
  async fetchChannelStats() {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CONFIG.CHANNEL_ID}&key=${CONFIG.YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const stats = data.items[0].statistics;
        return {
          subscribers: parseInt(stats.subscriberCount),
          videos: parseInt(stats.videoCount),
          views: parseInt(stats.viewCount)
        };
      }
    } catch (error) {
      console.error('Error fetching channel stats:', error);
      // Return fallback data
      return {
        subscribers: 2910000,
        videos: 927,
        views: 500000000
      };
    }
  },
  
  async fetchPlaylistVideos(playlistId, maxResults = 12) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${CONFIG.YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.items) {
        return data.items.map(item => ({
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
          publishedAt: item.snippet.publishedAt
        }));
      }
    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      return [];
    }
  },
  
  async fetchVideoDetails(videoIds) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${CONFIG.YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.items) {
        return data.items.map(item => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
          publishedAt: item.snippet.publishedAt,
          viewCount: parseInt(item.statistics.viewCount),
          likeCount: parseInt(item.statistics.likeCount),
          duration: item.contentDetails.duration
        }));
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
      return [];
    }
  },
  
  getEmbedUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  },
  
  getWatchUrl(videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
};

/* ===== VIDEO COMPONENTS ===== */
const VideoComponents = {
  createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.setAttribute('data-video-id', video.id);
    
    const viewCount = video.viewCount ? Utils.formatNumber(video.viewCount) : '';
    const publishDate = video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : '';
    
    card.innerHTML = `
      <div class="video-thumbnail">
        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
        <div class="play-button">
          <i class="fas fa-play"></i>
        </div>
      </div>
      <div class="video-info">
        <h3 class="video-title">${video.title}</h3>
        <div class="video-meta">
          ${viewCount ? `<span><i class="fas fa-eye"></i> ${viewCount} views</span>` : ''}
          ${publishDate ? `<span><i class="fas fa-calendar"></i> ${publishDate}</span>` : ''}
        </div>
        <p class="video-description">${this.truncateText(video.description, 100)}</p>
      </div>
    `;
    
    // Add click event to open video
    card.addEventListener('click', () => {
      this.openVideo(video.id);
    });
    
    return card;
  },
  
  createVideoGrid(videos, containerId) {
    const container = Utils.$(`#${containerId}`);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (videos.length === 0) {
      container.innerHTML = '<p class="text-center">No videos found.</p>';
      return;
    }
    
    videos.forEach(video => {
      const card = this.createVideoCard(video);
      container.appendChild(card);
    });
  },
  
  createFeaturedVideo(video) {
    return `
      <div class="featured-video" data-video-id="${video.id}">
        <div class="featured-video-thumbnail">
          <img src="${video.thumbnail}" alt="${video.title}">
          <div class="play-button">
            <i class="fas fa-play"></i>
          </div>
        </div>
        <div class="featured-video-info">
          <h3>${video.title}</h3>
          <p>${this.truncateText(video.description, 200)}</p>
          <div class="video-meta mb-3">
            ${video.viewCount ? `<span><i class="fas fa-eye"></i> ${Utils.formatNumber(video.viewCount)} views</span>` : ''}
            ${video.publishedAt ? `<span><i class="fas fa-calendar"></i> ${new Date(video.publishedAt).toLocaleDateString()}</span>` : ''}
          </div>
          <a href="${YouTubeAPI.getWatchUrl(video.id)}" target="_blank" class="btn btn-primary">
            <i class="fas fa-play"></i> Watch Now
          </a>
        </div>
      </div>
    `;
  },
  
  openVideo(videoId) {
    // Create modal for video playback
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
      <div class="video-modal-content">
        <div class="video-modal-header">
          <button class="video-modal-close">&times;</button>
        </div>
        <div class="video-modal-body">
          <iframe 
            src="${YouTubeAPI.getEmbedUrl(videoId)}&autoplay=1" 
            frameborder="0" 
            allowfullscreen
            allow="autoplay; encrypted-media">
          </iframe>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    // Close modal events
    const closeBtn = modal.querySelector('.video-modal-close');
    closeBtn.addEventListener('click', () => this.closeVideoModal(modal));
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeVideoModal(modal);
      }
    });
    
    // ESC key to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.closeVideoModal(modal);
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  },
  
  closeVideoModal(modal) {
    document.body.classList.remove('modal-open');
    modal.remove();
  },
  
  truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
};

/* ===== SEARCH FUNCTIONALITY ===== */
const Search = {
  init() {
    this.setupSearchInput();
    this.setupFilters();
  },
  
  setupSearchInput() {
    const searchInput = Utils.$('#video-search');
    if (!searchInput) return;
    
    const handleSearch = Utils.debounce((query) => {
      this.performSearch(query);
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });
  },
  
  setupFilters() {
    const filterButtons = Utils.$$('.filter-btn');
    
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const category = btn.getAttribute('data-category');
        this.filterByCategory(category);
      });
    });
  },
  
  async performSearch(query) {
    if (!query.trim()) {
      this.showAllVideos();
      return;
    }
    
    const videoCards = Utils.$$('.video-card');
    
    videoCards.forEach(card => {
      const title = card.querySelector('.video-title').textContent.toLowerCase();
      const description = card.querySelector('.video-description').textContent.toLowerCase();
      const searchQuery = query.toLowerCase();
      
      if (title.includes(searchQuery) || description.includes(searchQuery)) {
        card.style.display = 'block';
        card.classList.add('fade-in');
      } else {
        card.style.display = 'none';
      }
    });
  },
  
  filterByCategory(category) {
    const videoCards = Utils.$$('.video-card');
    
    videoCards.forEach(card => {
      if (category === 'all') {
        card.style.display = 'block';
      } else {
        const cardCategory = card.getAttribute('data-category');
        if (cardCategory === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      }
    });
  },
  
  showAllVideos() {
    const videoCards = Utils.$$('.video-card');
    videoCards.forEach(card => {
      card.style.display = 'block';
    });
  }
};

/* ===== FORM HANDLING ===== */
const Forms = {
  init() {
    this.setupContactForm();
    this.setupNewsletterForm();
    this.setupDonationForm();
  },
  
  setupContactForm() {
    const contactForm = Utils.$('#contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
      
      try {
        await this.submitContactForm(data);
        this.showSuccessMessage('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
      } catch (error) {
        this.showErrorMessage('Sorry, there was an error sending your message. Please try again.');
      }
    });
  },
  
  setupNewsletterForm() {
    const newsletterForms = Utils.$$('.newsletter-form');
    
    newsletterForms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = form.querySelector('input[type="email"]').value;
        
        try {
          await this.subscribeToNewsletter(email);
          this.showSuccessMessage('Successfully subscribed to our newsletter!');
          form.reset();
        } catch (error) {
          this.showErrorMessage('Error subscribing to newsletter. Please try again.');
        }
      });
    });
  },
  
  setupDonationForm() {
    const donationForm = Utils.$('#donation-form');
    if (!donationForm) return;
    
    // Setup amount buttons
    const amountButtons = Utils.$$('.amount-btn');
    const customAmountInput = Utils.$('#custom-amount');
    
    amountButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        amountButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const amount = btn.getAttribute('data-amount');
        if (customAmountInput) {
          customAmountInput.value = amount;
        }
      });
    });
    
    donationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.processDonation();
    });
  },
  
  async submitContactForm(data) {
    // Simulate API call - replace with actual endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Contact form submitted:', data);
        resolve();
      }, 1000);
    });
  },
  
  async subscribeToNewsletter(email) {
    // Simulate API call - replace with actual endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Newsletter subscription:', email);
        resolve();
      }, 1000);
    });
  },
  
  processDonation() {
    const amount = Utils.$('#custom-amount').value;
    const donationType = Utils.$('input[name="donation-type"]:checked').value;
    
    // Redirect to payment processor (Stripe, PayPal, etc.)
    const paymentUrl = `https://donate.towardseternity.com/?amount=${amount}&type=${donationType}`;
    window.open(paymentUrl, '_blank');
  },
  
  showSuccessMessage(message) {
    this.showNotification(message, 'success');
  },
  
  showErrorMessage(message) {
    this.showNotification(message, 'error');
  },
  
  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
  }
};

/* ===== ANIMATIONS & EFFECTS ===== */
const Animations = {
  init() {
    this.setupScrollAnimations();
    this.setupCounterAnimations();
    this.setupParallaxEffects();
  },
  
  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    Utils.$$('.video-card, .quick-access-card, .section-header').forEach(el => {
      observer.observe(el);
    });
  },
  
  setupCounterAnimations() {
    const counters = Utils.$$('.stat-number');
    
    const animateCounter = (counter) => {
      const target = parseInt(counter.getAttribute('data-count'));
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;
      
      const updateCounter = () => {
        current += step;
        if (current < target) {
          counter.textContent = Utils.formatNumber(Math.floor(current));
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = Utils.formatNumber(target);
        }
      };
      
      updateCounter();
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    });
    
    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  },
  
  setupParallaxEffects() {
    const parallaxElements = Utils.$$('.parallax');
    
    if (parallaxElements.length === 0) return;
    
    const handleScroll = Utils.throttle(() => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const rate = scrolled * -0.5;
        element.style.transform = `translateY(${rate}px)`;
      });
    }, 16);
    
    window.addEventListener('scroll', handleScroll);
  }
};

/* ===== PAGE-SPECIFIC FUNCTIONALITY ===== */
const PageHandlers = {
  async initHomepage() {
    // Load channel statistics
    const stats = await YouTubeAPI.fetchChannelStats();
    this.updateChannelStats(stats);
    
    // Load featured videos
    const featuredVideos = await YouTubeAPI.fetchVideoDetails(CONFIG.FEATURED_VIDEOS.whyIslam.slice(0, 3));
    this.displayFeaturedVideos(featuredVideos);
    
    // Setup quick access cards
    this.setupQuickAccessCards();
  },
  
  async initIslamVsChristianity() {
    const videos = await YouTubeAPI.fetchVideoDetails(CONFIG.FEATURED_VIDEOS.islamVsChristianity);
    VideoComponents.createVideoGrid(videos, 'islam-christianity-videos');
  },
  
  async initWhyIslam() {
    const videos = await YouTubeAPI.fetchVideoDetails(CONFIG.FEATURED_VIDEOS.whyIslam);
    VideoComponents.createVideoGrid(videos, 'why-islam-videos');
  },
  
  async initConverts() {
    const videos = await YouTubeAPI.fetchPlaylistVideos(CONFIG.PLAYLISTS.converts);
    VideoComponents.createVideoGrid(videos, 'convert-videos');
  },
  
  async initVideos() {
    // Load videos from multiple playlists
    const allVideos = [];
    
    for (const [category, playlistId] of Object.entries(CONFIG.PLAYLISTS)) {
      const videos = await YouTubeAPI.fetchPlaylistVideos(playlistId, 6);
      videos.forEach(video => {
        video.category = category;
        allVideos.push(video);
      });
    }
    
    VideoComponents.createVideoGrid(allVideos, 'all-videos');
  },
  
  updateChannelStats(stats) {
    const subscriberCount = Utils.$('#subscriber-count');
    const videoCount = Utils.$('#video-count');
    const viewCount = Utils.$('#view-count');
    
    if (subscriberCount) {
      subscriberCount.setAttribute('data-count', stats.subscribers);
      subscriberCount.textContent = Utils.formatNumber(stats.subscribers);
    }
    
    if (videoCount) {
      videoCount.setAttribute('data-count', stats.videos);
      videoCount.textContent = Utils.formatNumber(stats.videos);
    }
    
    if (viewCount) {
      viewCount.setAttribute('data-count', stats.views);
      viewCount.textContent = Utils.formatNumber(stats.views);
    }
  },
  
  displayFeaturedVideos(videos) {
    const container = Utils.$('#featured-videos');
    if (!container || videos.length === 0) return;
    
    container.innerHTML = videos.map(video => 
      VideoComponents.createFeaturedVideo(video)
    ).join('');
    
    // Add click events to featured videos
    container.querySelectorAll('.featured-video').forEach(videoEl => {
      videoEl.addEventListener('click', () => {
        const videoId = videoEl.getAttribute('data-video-id');
        VideoComponents.openVideo(videoId);
      });
    });
  },
  
  setupQuickAccessCards() {
    const quickAccessCards = Utils.$$('.quick-access-card');
    
    quickAccessCards.forEach(card => {
      card.addEventListener('click', () => {
        const target = card.getAttribute('data-target');
        if (target) {
          window.location.href = target;
        }
      });
    });
  }
};

/* ===== LANGUAGE SWITCHING ===== */
const LanguageHandler = {
  init() {
    this.setupLanguageSelector();
    this.loadLanguagePreference();
  },
  
  setupLanguageSelector() {
    const languageSelect = Utils.$('#language-select');
    if (!languageSelect) return;
    
    languageSelect.addEventListener('change', (e) => {
      const selectedLanguage = e.target.value;
      this.switchLanguage(selectedLanguage);
    });
  },
  
  switchLanguage(language) {
    // Store language preference
    localStorage.setItem('preferred-language', language);
    
    // Redirect to language-specific version
    const currentPage = Utils.getCurrentPage();
    const languageUrls = {
      'en': './',
      'ar': './ar/',
      'tr': './tr/',
      'ur': './ur/',
      'bn': './bn/',
      'ru': './ru/',
      'id': './id/',
      'de': './de/',
      'fr': './fr/',
      'es': './es/'
    };
    
    if (languageUrls[language]) {
      window.location.href = languageUrls[language] + (currentPage === 'index' ? '' : currentPage + '.html');
    }
  },
  
  loadLanguagePreference() {
    const preferredLanguage = localStorage.getItem('preferred-language');
    const languageSelect = Utils.$('#language-select');
    
    if (preferredLanguage && languageSelect) {
      languageSelect.value = preferredLanguage;
    }
  }
};

/* ===== ANALYTICS & TRACKING ===== */
const Analytics = {
  init() {
    this.trackPageView();
    this.setupEventTracking();
  },
  
  trackPageView() {
    const page = Utils.getCurrentPage();
    
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
    
    console.log(`Page view tracked: ${page}`);
  },
  
  setupEventTracking() {
    // Track video clicks
    document.addEventListener('click', (e) => {
      const videoCard = e.target.closest('.video-card');
      if (videoCard) {
        const videoId = videoCard.getAttribute('data-video-id');
        this.trackEvent('video_click', {
          video_id: videoId,
          page: Utils.getCurrentPage()
        });
      }
      
      // Track button clicks
      if (e.target.classList.contains('btn')) {
        const buttonText = e.target.textContent.trim();
        this.trackEvent('button_click', {
          button_text: buttonText,
          page: Utils.getCurrentPage()
        });
      }
      
      // Track external links
      if (e.target.tagName === 'A' && e.target.hostname !== window.location.hostname) {
        this.trackEvent('external_link_click', {
          url: e.target.href,
		   page: Utils.getCurrentPage()
        });
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', (e) => {
      const formId = e.target.id;
      if (formId) {
        this.trackEvent('form_submit', {
          form_id: formId,
          page: Utils.getCurrentPage()
        });
      }
    });
    
    // Track scroll depth
    this.setupScrollTracking();
  },
  
  setupScrollTracking() {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 100];
    const trackedMilestones = new Set();
    
    const handleScroll = Utils.throttle(() => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
            trackedMilestones.add(milestone);
            this.trackEvent('scroll_depth', {
              percent: milestone,
              page: Utils.getCurrentPage()
            });
          }
        });
      }
    }, 1000);
    
    window.addEventListener('scroll', handleScroll);
  },
  
  trackEvent(eventName, parameters = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
    
    // Console log for development
    console.log(`Event tracked: ${eventName}`, parameters);
  }
};

/* ===== PERFORMANCE OPTIMIZATION ===== */
const Performance = {
  init() {
    this.setupLazyLoading();
    this.setupImageOptimization();
    this.setupCaching();
  },
  
  setupLazyLoading() {
    const images = Utils.$$('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => {
        imageObserver.observe(img);
      });
    }
  },
  
  setupImageOptimization() {
    const images = Utils.$$('img');
    
    images.forEach(img => {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
      
      img.addEventListener('error', () => {
        img.classList.add('error');
        // Set fallback image
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
      });
    });
  },
  
  setupCaching() {
    // Cache API responses
    const cache = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    window.apiCache = {
      get(key) {
        const item = cache.get(key);
        if (item && Date.now() - item.timestamp < CACHE_DURATION) {
          return item.data;
        }
        cache.delete(key);
        return null;
      },
      
      set(key, data) {
        cache.set(key, {
          data,
          timestamp: Date.now()
        });
      },
      
      clear() {
        cache.clear();
      }
    };
  }
};

/* ===== ERROR HANDLING ===== */
const ErrorHandler = {
  init() {
    this.setupGlobalErrorHandling();
    this.setupNetworkErrorHandling();
  },
  
  setupGlobalErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this.logError('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this.logError('promise_rejection', {
        reason: e.reason.toString()
      });
    });
  },
  
  setupNetworkErrorHandling() {
    // Override fetch to add error handling
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response;
      } catch (error) {
        this.logError('network_error', {
          url: args[0],
          error: error.message
        });
        throw error;
      }
    };
  },
  
  logError(type, details) {
    // Send to analytics
    Analytics.trackEvent('error', {
      error_type: type,
      ...details,
      page: Utils.getCurrentPage(),
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  },
  
  showUserFriendlyError(message = 'Something went wrong. Please try again.') {
    Forms.showErrorMessage(message);
  }
};

/* ===== ACCESSIBILITY FEATURES ===== */
const Accessibility = {
  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
  },
  
  setupKeyboardNavigation() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--primary-green);
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1001;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Keyboard navigation for video cards
    const videoCards = Utils.$$('.video-card');
    videoCards.forEach((card, index) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Play video: ${card.querySelector('.video-title').textContent}`);
      
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  },
  
  setupFocusManagement() {
    // Focus trap for modals
    const trapFocus = (element) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      });
      
      firstElement.focus();
    };
    
    // Apply focus trap to modals when they open
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.classList && node.classList.contains('video-modal')) {
            trapFocus(node);
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true });
  },
  
  setupScreenReaderSupport() {
    // Add ARIA labels and descriptions
    const videoCards = Utils.$$('.video-card');
    videoCards.forEach(card => {
      const title = card.querySelector('.video-title').textContent;
      const meta = card.querySelector('.video-meta').textContent;
      
      card.setAttribute('aria-describedby', `${card.id || 'video'}-description`);
      
      const description = document.createElement('div');
      description.id = `${card.id || 'video'}-description`;
      description.className = 'sr-only';
      description.textContent = `${title}. ${meta}`;
      card.appendChild(description);
    });
    
    // Live region for dynamic content updates
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
    
    window.announceToScreenReader = (message) => {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    };
  }
};

/* ===== MAIN INITIALIZATION ===== */
const App = {
  async init() {
    try {
      // Initialize core functionality
      Navigation.init();
      Search.init();
      Forms.init();
      Animations.init();
      LanguageHandler.init();
      Analytics.init();
      Performance.init();
      ErrorHandler.init();
      Accessibility.init();
      
      // Initialize page-specific functionality
      const currentPage = Utils.getCurrentPage();
      
      switch (currentPage) {
        case 'index':
          await PageHandlers.initHomepage();
          break;
        case 'islam-vs-christianity':
          await PageHandlers.initIslamVsChristianity();
          break;
        case 'why-islam':
          await PageHandlers.initWhyIslam();
          break;
        case 'converts':
          await PageHandlers.initConverts();
          break;
        case 'videos':
          await PageHandlers.initVideos();
          break;
      }
      
      // Add loaded class to body
      document.body.classList.add('loaded');
      
      console.log('Towards Eternity website initialized successfully');
      
    } catch (error) {
      console.error('Error initializing website:', error);
      ErrorHandler.logError('initialization_error', {
        message: error.message,
        stack: error.stack
      });
    }
  }
};

/* ===== ADDITIONAL UTILITY FUNCTIONS ===== */

// YouTube URL helpers
window.getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Social sharing functions
window.shareOnFacebook = (url, title) => {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

window.shareOnTwitter = (url, title) => {
  const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

window.shareOnWhatsApp = (url, title) => {
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
  window.open(shareUrl, '_blank');
};

// Copy to clipboard function
window.copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    Forms.showSuccessMessage('Copied to clipboard!');
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    Forms.showSuccessMessage('Copied to clipboard!');
  }
};

// Prayer times API (optional feature)
window.getPrayerTimes = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
    );
    const data = await response.json();
    return data.data.timings;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
};

// Islamic date converter
window.getIslamicDate = () => {
  const today = new Date();
  const islamicDate = new Intl.DateTimeFormat('en-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(today);
  return islamicDate;
};

/* ===== CSS INJECTION FOR DYNAMIC STYLES ===== */
const injectDynamicStyles = () => {
  const styles = `
    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }
    
    .video-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.3s ease;
    }
    
    .video-modal-content {
      position: relative;
      width: 90%;
      max-width: 800px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .video-modal-header {
      display: flex;
      justify-content: flex-end;
      padding: 10px;
      background: #f5f5f5;
    }
    
    .video-modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .video-modal-close:hover {
      background: #e0e0e0;
    }
    
    .video-modal-body iframe {
      width: 100%;
      height: 450px;
      border: none;
    }
    
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 3000;
      animation: slideInRight 0.3s ease;
    }
    
    .notification-success {
      border-left: 4px solid #4CAF50;
    }
    
    .notification-error {
      border-left: 4px solid #f44336;
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
    }
    
    .notification-close {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      margin-left: auto;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .notification-close:hover {
      background: #f0f0f0;
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .modal-open {
      overflow: hidden;
    }
    
    .menu-open {
      overflow: hidden;
    }
    
    @media (max-width: 768px) {
      .video-modal-content {
        width: 95%;
        margin: 20px;
      }
      
      .video-modal-body iframe {
        height: 250px;
      }
      
      .notification {
        left: 20px;
        right: 20px;
        top: auto;
        bottom: 20px;
      }
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
};

/* ===== DOCUMENT READY ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Inject dynamic styles
  injectDynamicStyles();
  
  // Initialize the application
  App.init();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden - pause any ongoing processes
    console.log('Page hidden');
  } else {
    // Page is visible - resume processes
    console.log('Page visible');
  }
});

// Handle online/offline status
window.addEventListener('online', () => {
  Forms.showSuccessMessage('Connection restored');
});

window.addEventListener('offline', () => {
  Forms.showErrorMessage('No internet connection');
});

// Export for external use
window.TowardsEternity = {
  Utils,
  Navigation,
  YouTubeAPI,
  VideoComponents,
  Search,
  Forms,
  Analytics,
  Performance,
  ErrorHandler,
  Accessibility
};

console.log('Towards Eternity JavaScript loaded successfully');