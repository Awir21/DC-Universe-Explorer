// ===============================
// ELEMENT SELECTION (Caching Semua Elemen DOM)
// ===============================
const heroContainer = document.getElementById("hero-container");
const searchInput = document.getElementById("search");
const modal = document.getElementById("hero-modal");
const closeModal = document.getElementById("close-modal");
const loadingScreen = document.getElementById("loading-screen");
const introMusic = document.getElementById("intro-music");
const musicBtn = document.getElementById("music-btn");
const themeToggle = document.getElementById("theme-toggle");
const scrollTopBtn = document.getElementById("scroll-top");
const heroCounter = document.getElementById("hero-counter");

// Cache elemen-elemen modal agar tidak perlu dicari berulang kali
const modalImage = document.getElementById("modal-image");
const modalName = document.getElementById("modal-name");
const modalFullname = document.getElementById("modal-fullname");
const modalPlace = document.getElementById("modal-place");
const modalFirst = document.getElementById("modal-first");
const modalStats = document.getElementById("modal-stats");
const modalAlignment = document.getElementById("modal-alignment");
const modalFavorite = document.getElementById("modal-favorite");
const modalCompare = document.getElementById("modal-compare");
const modalShare = document.getElementById("modal-share");
const powerChart = document.getElementById("power-chart");

// Filter elements
const powerFilter = document.getElementById("power-filter");
const alignmentFilter = document.getElementById("alignment-filter");
const categoryFilter = document.getElementById("category-filter");
const showFavorites = document.getElementById("show-favorites");
const showStatisticsBtn = document.getElementById("show-statistics");
const compareHeroes = document.getElementById("compare-heroes");

// Modal elements
const statsModal = document.getElementById("stats-modal");
const closeStats = document.getElementById("close-stats");
const statsContent = document.getElementById("stats-content");
const compareModal = document.getElementById("compare-modal");
const closeCompare = document.getElementById("close-compare");
const compareContent = document.getElementById("compare-content");

// Search history
const searchHistoryContainer = document.getElementById("search-history");

// ENCAPSULATING STATE
const appState = {
    dcHeroes: [],
    filteredHeroes: [],
    favorites: JSON.parse(localStorage.getItem('dcFavorites')) || [],
    compareList: JSON.parse(localStorage.getItem('dcCompare')) || [],
    searchHistory: JSON.parse(localStorage.getItem('searchHistory')) || [],
    currentTheme: localStorage.getItem('theme') || 'dark',
    currentView: 'all'
};

// ===============================
// THEME MANAGEMENT
// ===============================
function initTheme() {
    document.documentElement.setAttribute('data-theme', appState.currentTheme);
    themeToggle.textContent = appState.currentTheme === 'dark' ? '🌙' : '☀️';
}

themeToggle.addEventListener('click', () => {
    appState.currentTheme = appState.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', appState.currentTheme);
    themeToggle.textContent = appState.currentTheme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('theme', appState.currentTheme);
});

// ===============================
// SCROLL TO TOP
// ===============================
function initScrollTop() {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===============================
// MUSIC HANDLING - FIXED (Loop Continuous)
// ===============================
function playMusicFadeIn() {
    if (!introMusic.paused) return;

    // Set music to loop continuously
    introMusic.loop = true;
    introMusic.volume = 0;
    
    introMusic.play()
        .then(() => {
            let vol = 0;
            const fadeIn = setInterval(() => {
                if (vol < 0.3) { // Reduced volume for better UX
                    vol += 0.05;
                    introMusic.volume = vol;
                } else {
                    clearInterval(fadeIn);
                }
            }, 200);
            musicBtn.textContent = "🔇 Stop";
        })
        .catch((error) => {
            console.warn("⚠️ Autoplay diblokir:", error);
            musicBtn.textContent = "🎵 Play";
        });
}

// Auto-play music when page loads (with user interaction requirement)
document.addEventListener('click', function initMusic() {
    if (introMusic.paused) {
        playMusicFadeIn();
    }
    // Remove event listener after first click
    document.removeEventListener('click', initMusic);
});

musicBtn.addEventListener("click", () => {
    if (introMusic.paused) {
        playMusicFadeIn();
    } else {
        introMusic.pause();
        musicBtn.textContent = "🎵 Play";
    }
});

// Restart music when it ends (backup for loop)
introMusic.addEventListener('ended', function() {
    introMusic.currentTime = 0;
    introMusic.play();
});

// ===============================
// LOADING SCREEN
// ===============================
window.addEventListener("load", () => {
    setTimeout(() => {
        loadingScreen.classList.add("hidden");
        initTheme();
        initScrollTop();
        initSearchHistory();
        updateHeroCounter();
    }, 1200);
});

// ===============================
// SEARCH HISTORY
// ===============================
function initSearchHistory() {
    updateSearchHistoryUI();
}

function addToSearchHistory(query) {
    if (query && !appState.searchHistory.includes(query.toLowerCase())) {
        appState.searchHistory.unshift(query.toLowerCase());
        appState.searchHistory = appState.searchHistory.slice(0, 5);
        localStorage.setItem('searchHistory', JSON.stringify(appState.searchHistory));
        updateSearchHistoryUI();
    }
}

function updateSearchHistoryUI() {
    if (appState.searchHistory.length === 0) {
        searchHistoryContainer.style.display = 'none';
        return;
    }

    searchHistoryContainer.style.display = 'flex';
    searchHistoryContainer.innerHTML = appState.searchHistory.map(term => `
        <div class="search-history-item" data-term="${term}">
            ${term}
        </div>
    `).join('');

    // Add event listeners to history items
    searchHistoryContainer.querySelectorAll('.search-history-item').forEach(item => {
        item.addEventListener('click', () => {
            searchInput.value = item.dataset.term;
            filterHeroes();
        });
    });
}

// ===============================
// FAVORITES SYSTEM
// ===============================
function toggleFavorite(heroId) {
    const index = appState.favorites.indexOf(heroId);
    if (index > -1) {
        appState.favorites.splice(index, 1);
    } else {
        appState.favorites.push(heroId);
    }
    localStorage.setItem('dcFavorites', JSON.stringify(appState.favorites));
    updateFavoriteUI();
    
    // Update modal favorite button if this hero is currently displayed
    const currentHeroId = Number(modal.dataset.currentHeroId);
    if (currentHeroId === heroId) {
        updateModalFavoriteButton(heroId);
    }
}

function updateFavoriteUI() {
    document.querySelectorAll('.hero-card').forEach(card => {
        const heart = card.querySelector('.favorite-heart');
        const heroId = Number(card.dataset.id);
        if (heart) {
            heart.classList.toggle('active', appState.favorites.includes(heroId));
            heart.textContent = appState.favorites.includes(heroId) ? '❤️' : '🤍';
        }
    });
}

function updateModalFavoriteButton(heroId) {
    if (modalFavorite) {
        const isFavorite = appState.favorites.includes(heroId);
        modalFavorite.classList.toggle('active', isFavorite);
        modalFavorite.textContent = isFavorite ? '❤️ Favorite' : '☆ Add Favorite';
    }
}

// ===============================
// COMPARE SYSTEM
// ===============================
function toggleCompare(heroId) {
    const index = appState.compareList.indexOf(heroId);
    if (index > -1) {
        appState.compareList.splice(index, 1);
    } else {
        if (appState.compareList.length < 3) {
            appState.compareList.push(heroId);
        } else {
            alert('Maximum 3 heroes can be compared at once');
            return;
        }
    }
    localStorage.setItem('dcCompare', JSON.stringify(appState.compareList));
    updateCompareUI();
}

function updateCompareUI() {
    document.querySelectorAll('.hero-card').forEach(card => {
        const check = card.querySelector('.compare-check');
        const heroId = Number(card.dataset.id);
        if (check) {
            check.checked = appState.compareList.includes(heroId);
        }
    });

    // Update compare button text
    if (compareHeroes) {
        const count = appState.compareList.length;
        compareHeroes.textContent = `⚖️ Compare (${count})`;
        compareHeroes.disabled = count === 0;
    }
}

function showCompareModal() {
    if (appState.compareList.length === 0) {
        alert('Please select heroes to compare first');
        return;
    }

    const compareHeroesData = appState.compareList.map(id => 
        appState.dcHeroes.find(hero => hero.id === id)
    ).filter(hero => hero);

    // Add class based on number of heroes for responsive layout
    const heroCount = compareHeroesData.length;
    const layoutClass = 
        heroCount === 1 ? 'single-hero' : 
        heroCount === 2 ? 'two-heroes' : 'three-heroes';

    compareContent.innerHTML = `
        <div class="compare-header">
            Comparing ${heroCount} hero${heroCount > 1 ? 'es' : ''}
        </div>
        <div class="compare-content ${layoutClass}">
            ${compareHeroesData.map(hero => `
                <div class="compare-hero">
                    <img src="${hero.images.md}" alt="${hero.name}">
                    <h3>${hero.name}</h3>
                    <p><strong>Real Name:</strong><br>${hero.biography.fullName || '-'}</p>
                    <p><strong>Alignment:</strong><br>
                        <span style="color: ${
                            hero.biography.alignment === 'good' ? '#00ff88' : 
                            hero.biography.alignment === 'bad' ? '#ff4444' : '#ffaa00'
                        }">
                            ${hero.biography.alignment}
                        </span>
                    </p>
                    <div class="power-chart">
                        ${Object.entries(hero.powerstats).map(([stat, value]) => `
                            <div class="power-bar">
                                <span class="power-label">${stat.substring(0, 3)}</span>
                                <div class="power-value">
                                    <div class="power-fill" style="width: ${value}%"></div>
                                </div>
                                <span>${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        <button class="clear-compare-btn" onclick="clearCompareList()">Clear</button>
    `;

    compareModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function clearCompareList() {
    appState.compareList = [];
    localStorage.setItem('dcCompare', JSON.stringify(appState.compareList));
    updateCompareUI();
    closeCompareModal();
}

// ===============================
// STATISTICS SYSTEM
// ===============================
function showStatistics() {
    const stats = calculateStatistics();
    
    statsContent.innerHTML = `
        <div class="stat-card">
            <h3>Total Heroes</h3>
            <div class="stat-value">${stats.totalHeroes}</div>
            <p>DC Characters</p>
        </div>
        <div class="stat-card">
            <h3>Heroes vs Villains</h3>
            <div class="stat-value">${stats.heroesCount}/${stats.villainsCount}</div>
            <p>Good vs Evil</p>
        </div>
        <div class="stat-card">
            <h3>Average Intelligence</h3>
            <div class="stat-value">${stats.avgIntelligence}</div>
            <p>Out of 100</p>
        </div>
        <div class="stat-card">
            <h3>Average Strength</h3>
            <div class="stat-value">${stats.avgStrength}</div>
            <p>Out of 100</p>
        </div>
        <div class="stat-card">
            <h3>Strongest Hero</h3>
            <div class="stat-value">${stats.strongestHero}</div>
            <p>Power: ${stats.maxStrength}</p>
        </div>
        <div class="stat-card">
            <h3>Smartest Hero</h3>
            <div class="stat-value">${stats.smartestHero}</div>
            <p>IQ: ${stats.maxIntelligence}</p>
        </div>
    `;

    statsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function calculateStatistics() {
    const heroes = appState.dcHeroes;
    const goodHeroes = heroes.filter(h => h.biography.alignment === 'good');
    const badHeroes = heroes.filter(h => h.biography.alignment === 'bad');
    
    const totalIntelligence = heroes.reduce((sum, hero) => sum + (parseInt(hero.powerstats.intelligence) || 0), 0);
    const totalStrength = heroes.reduce((sum, hero) => sum + (parseInt(hero.powerstats.strength) || 0), 0);
    
    const strongestHero = heroes.reduce((max, hero) => 
        (parseInt(hero.powerstats.strength) || 0) > (parseInt(max.powerstats.strength) || 0) ? hero : max
    );
    
    const smartestHero = heroes.reduce((max, hero) => 
        (parseInt(hero.powerstats.intelligence) || 0) > (parseInt(max.powerstats.intelligence) || 0) ? hero : max
    );

    return {
        totalHeroes: heroes.length,
        heroesCount: goodHeroes.length,
        villainsCount: badHeroes.length,
        avgIntelligence: Math.round(totalIntelligence / heroes.length),
        avgStrength: Math.round(totalStrength / heroes.length),
        strongestHero: strongestHero.name,
        maxStrength: strongestHero.powerstats.strength,
        smartestHero: smartestHero.name,
        maxIntelligence: smartestHero.powerstats.intelligence
    };
}

// ===============================
// SHARE FEATURE
// ===============================
function shareHero(hero) {
    if (navigator.share) {
        navigator.share({
            title: `Check out ${hero.name}!`,
            text: `Discover ${hero.name}'s powers in DC Universe Explorer`,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        const text = `Check out ${hero.name} from DC Universe!\nReal Name: ${hero.biography.fullName || 'Unknown'}\nPower Stats: ${Object.entries(hero.powerstats).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Hero info copied to clipboard!');
        });
    }
}

// ===============================
// POWER CHART
// ===============================
function createPowerChart(hero) {
    if (!powerChart) return;
    
    powerChart.innerHTML = Object.entries(hero.powerstats)
        .map(([stat, value]) => `
            <div class="power-bar">
                <span class="power-label">${stat.toUpperCase()}</span>
                <div class="power-value">
                    <div class="power-fill" style="width: ${value}%"></div>
                </div>
                <span>${value}</span>
            </div>
        `).join('');
}

// ===============================
// FILTER SYSTEM
// ===============================
function filterHeroes() {
    let filtered = [...appState.dcHeroes];
    const searchTerm = searchInput.value.toLowerCase();
    const powerValue = powerFilter.value;
    const alignmentValue = alignmentFilter.value;
    const categoryValue = categoryFilter.value;

    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(hero =>
            hero.name.toLowerCase().includes(searchTerm) ||
            (hero.biography.fullName && hero.biography.fullName.toLowerCase().includes(searchTerm))
        );
        addToSearchHistory(searchTerm);
    }

    // Power filter
    if (powerValue) {
        filtered = filtered.filter(hero => 
            parseInt(hero.powerstats[powerValue]) >= 80
        );
    }

    // Alignment filter
    if (alignmentValue) {
        filtered = filtered.filter(hero => 
            hero.biography.alignment === alignmentValue
        );
    }

    // Category filter (simplified)
    if (categoryValue) {
        filtered = filtered.filter(hero => {
            const aliases = hero.biography.aliases || [];
            const fullName = hero.biography.fullName || '';
            
            switch(categoryValue) {
                case 'justiceLeague':
                    return aliases.some(alias => 
                        alias.toLowerCase().includes('justice') || 
                        aliases.includes('Justice League')
                    );
                case 'batmanFamily':
                    return fullName.includes('Wayne') || 
                           aliases.some(alias => alias.includes('Batman') || alias.includes('Robin'));
                case 'supermanFamily':
                    return fullName.includes('Kent') || 
                           aliases.some(alias => alias.includes('Superman'));
                case 'greenLantern':
                    return aliases.some(alias => 
                        alias.includes('Green Lantern') || 
                        hero.name.includes('Green Lantern')
                    );
                default:
                    return true;
            }
        });
    }

    // Favorites view
    if (appState.currentView === 'favorites') {
        filtered = filtered.filter(hero => appState.favorites.includes(hero.id));
    }

    appState.filteredHeroes = filtered;
    displayHeroes(filtered);
    updateHeroCounter();
}

// ===============================
// HERO COUNTER
// ===============================
function updateHeroCounter() {
    const total = appState.dcHeroes.length;
    const showing = appState.filteredHeroes.length;
    
    if (showing === total) {
        heroCounter.textContent = `Showing all ${total} heroes`;
    } else {
        heroCounter.textContent = `Showing ${showing} of ${total} heroes`;
    }
}

// ===============================
// FETCH DATA HERO DC - SIMPLIFIED
// ===============================
async function fetchHeroes() {
  try {
    console.log("🔄 Starting to fetch heroes...");
    
    const res = await fetch("https://akabab.github.io/superhero-api/api/all.json");
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("✅ Data fetched successfully:", data.length, "heroes");
    
    // Filter DC heroes
    appState.dcHeroes = data.filter(hero => {
      return hero.biography && hero.biography.publisher === "DC Comics";
    });
    
    console.log("🦸 DC Heroes found:", appState.dcHeroes.length);
    
    appState.filteredHeroes = [...appState.dcHeroes];
    displayHeroes(appState.filteredHeroes);
    updateHeroCounter();
    
  } catch (error) {
    console.error("❌ Gagal mengambil data:", error);
    
    // Langsung fallback ke data statis
    showFallbackData();
  }
}

// ===============================
// FALLBACK DATA - Data DC Heroes statis
// ===============================
function showFallbackData() {
  console.log("🆘 Using fallback data...");
  
  const fallbackHeroes = [
    {
      id: 1,
      name: "Superman",
      biography: {
        fullName: "Clark Kent",
        publisher: "DC Comics",
        placeOfBirth: "Krypton",
        firstAppearance: "Action Comics #1",
        alignment: "good",
        aliases: ["Man of Steel", "Superman"]
      },
      powerstats: {
        intelligence: 100,
        strength: 100,
        speed: 100,
        durability: 100,
        power: 100,
        combat: 85
      },
      images: {
        md: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/644-superman.jpg",
        lg: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/644-superman.jpg"
      },
      appearance: {
        race: "Kryptonian"
      }
    },
    {
      id: 2,
      name: "Batman",
      biography: {
        fullName: "Bruce Wayne",
        publisher: "DC Comics",
        placeOfBirth: "Gotham City",
        firstAppearance: "Detective Comics #27",
        alignment: "good",
        aliases: ["Dark Knight", "Batman"]
      },
      powerstats: {
        intelligence: 100,
        strength: 26,
        speed: 27,
        durability: 50,
        power: 47,
        combat: 100
      },
      images: {
        md: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/70-batman.jpg",
        lg: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/70-batman.jpg"
      },
      appearance: {
        race: "Human"
      }
    },
    {
      id: 3,
      name: "Wonder Woman",
      biography: {
        fullName: "Diana Prince",
        publisher: "DC Comics",
        placeOfBirth: "Themyscira",
        firstAppearance: "All Star Comics #8",
        alignment: "good",
        aliases: ["Amazon Princess", "Wonder Woman"]
      },
      powerstats: {
        intelligence: 88,
        strength: 100,
        speed: 79,
        durability: 100,
        power: 100,
        combat: 100
      },
      images: {
        md: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/720-wonder-woman.jpg",
        lg: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/720-wonder-woman.jpg"
      },
      appearance: {
        race: "Amazon"
      }
    },
    {
      id: 4,
      name: "The Flash",
      biography: {
        fullName: "Barry Allen",
        publisher: "DC Comics",
        placeOfBirth: "Fallville, Iowa",
        firstAppearance: "Showcase #4",
        alignment: "good",
        aliases: ["Scarlet Speedster", "The Flash"]
      },
      powerstats: {
        intelligence: 88,
        strength: 48,
        speed: 100,
        durability: 60,
        power: 100,
        combat: 60
      },
      images: {
        md: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/263-flash.jpg",
        lg: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/263-flash.jpg"
      },
      appearance: {
        race: "Human"
      }
    },
    {
      id: 5,
      name: "Green Lantern",
      biography: {
        fullName: "Hal Jordan",
        publisher: "DC Comics",
        placeOfBirth: "Coast City",
        firstAppearance: "Showcase #22",
        alignment: "good",
        aliases: ["Emerald Knight", "Green Lantern"]
      },
      powerstats: {
        intelligence: 80,
        strength: 90,
        speed: 53,
        durability: 64,
        power: 100,
        combat: 64
      },
      images: {
        md: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/259-green-lantern.jpg",
        lg: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/259-green-lantern.jpg"
      },
      appearance: {
        race: "Human"
      }
    },
    {
      id: 6,
      name: "Joker",
      biography: {
        fullName: "Jack Napier",
        publisher: "DC Comics",
        placeOfBirth: "-",
        firstAppearance: "Batman #1",
        alignment: "bad",
        aliases: ["Clown Prince of Crime", "Joker"]
      },
      powerstats: {
        intelligence: 100,
        strength: 10,
        speed: 12,
        durability: 60,
        power: 43,
        combat: 70
      },
      images: {
        md: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/370-joker.jpg",
        lg: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/370-joker.jpg"
      },
      appearance: {
        race: "Human"
      }
    }
  ];
  
  appState.dcHeroes = fallbackHeroes;
  appState.filteredHeroes = [...fallbackHeroes];
  displayHeroes(appState.filteredHeroes);
  updateHeroCounter();
}

// ===============================
// SKELETON LOADING
// ===============================
function showSkeletonLoading() {
  const skeletonCount = 12;
  heroContainer.innerHTML = Array(skeletonCount).fill(`
    <div class="skeleton-card"></div>
  `).join('');
}

// ===============================
// TAMPILKAN HERO
// ===============================
function displayHeroes(heroes) {
    heroContainer.innerHTML = heroes.map(hero => `
        <div class="hero-card" data-id="${hero.id}">
            ${appState.favorites.includes(hero.id) ? '<div class="hero-badge">FAV</div>' : ''}
            <button class="favorite-heart ${appState.favorites.includes(hero.id) ? 'active' : ''}" 
                    onclick="event.stopPropagation(); toggleFavorite(${hero.id})">
                ${appState.favorites.includes(hero.id) ? '❤️' : '🤍'}
            </button>
            <input type="checkbox" class="compare-check" 
                   ${appState.compareList.includes(hero.id) ? 'checked' : ''}
                   onclick="event.stopPropagation(); toggleCompare(${hero.id})">
            <img src="${hero.images.md}" alt="${hero.name}" 
                 onerror="this.src='https://via.placeholder.com/300x400/333/fff?text=Image+Not+Found'">
            <div class="hero-info">
                <h3>${hero.name}</h3>
                <p>${hero.biography.fullName || '-'}</p>
                <small>${hero.biography.alignment} • ${hero.appearance.race || 'Human'}</small>
            </div>
        </div>
    `).join("");
}

// ===============================
// MODAL DETAIL HERO
// ===============================
function showHeroDetail(id) {
    const hero = appState.dcHeroes.find(h => h.id === id);
    if (!hero) return;

    modal.dataset.currentHeroId = id;
    
    modalImage.src = hero.images.lg;
    modalImage.alt = hero.name;
    
    modalName.innerText = hero.name;
    modalFullname.innerText = hero.biography?.fullName || "-";
    modalPlace.innerText = hero.biography?.placeOfBirth || "-";
    modalFirst.innerText = hero.biography?.firstAppearance || "-";
    modalAlignment.innerText = hero.biography?.alignment || "-";

    modalStats.innerHTML = Object.entries(hero.powerstats)
        .map(([stat, value]) => `<li>${stat.toUpperCase()}: ${value}</li>`)
        .join("");

    createPowerChart(hero);
    updateModalFavoriteButton(id);
    
    // Update compare button in modal
    const isInCompare = appState.compareList.includes(id);
    modalCompare.classList.toggle('active', isInCompare);
    modalCompare.textContent = isInCompare ? '✅ In Compare' : '⚖️ Add to Compare';

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

// Update modal event listeners
if (modalFavorite) {
    modalFavorite.addEventListener('click', (e) => {
        e.stopPropagation();
        const heroId = Number(modal.dataset.currentHeroId);
        toggleFavorite(heroId);
    });
}

if (modalCompare) {
    modalCompare.addEventListener('click', (e) => {
        e.stopPropagation();
        const heroId = Number(modal.dataset.currentHeroId);
        toggleCompare(heroId);
        // Update button text immediately
        const isInCompare = appState.compareList.includes(heroId);
        modalCompare.classList.toggle('active', isInCompare);
        modalCompare.textContent = isInCompare ? '✅ In Compare' : '⚖️ Add to Compare';
    });
}

if (modalShare) {
    modalShare.addEventListener('click', (e) => {
        e.stopPropagation();
        const heroId = Number(modal.dataset.currentHeroId);
        const hero = appState.dcHeroes.find(h => h.id === heroId);
        if (hero) {
            shareHero(hero);
        }
    });
}

// Fungsi (DRY) untuk menutup modal
function closeHeroModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

function closeStatsModal() {
    statsModal.style.display = "none";
    document.body.style.overflow = "auto";
}

function closeCompareModal() {
    compareModal.style.display = "none";
    document.body.style.overflow = "auto";
}

// Event listener untuk menutup modal
closeModal.onclick = closeHeroModal;
closeStats.onclick = closeStatsModal;
closeCompare.onclick = closeCompareModal;

window.onclick = e => {
    if (e.target === modal) closeHeroModal();
    if (e.target === statsModal) closeStatsModal();
    if (e.target === compareModal) closeCompareModal();
};

// ===============================
// FITUR SEARCH & FILTERS
// ===============================
let searchTimeout;
searchInput.addEventListener("input", e => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterHeroes();
    }, 300);
});

// Filter event listeners
powerFilter.addEventListener('change', filterHeroes);
alignmentFilter.addEventListener('change', filterHeroes);
categoryFilter.addEventListener('change', filterHeroes);

// View buttons
showFavorites.addEventListener('click', () => {
    appState.currentView = appState.currentView === 'favorites' ? 'all' : 'favorites';
    showFavorites.classList.toggle('active', appState.currentView === 'favorites');
    filterHeroes();
});

// Event listener untuk statistics button
if (showStatisticsBtn) {
    showStatisticsBtn.addEventListener('click', showStatistics);
}

if (compareHeroes) {
    compareHeroes.addEventListener('click', showCompareModal);
}

// ===============================
// EVENT LISTENER UNTUK KARTU (EVENT DELEGATION)
// ===============================
heroContainer.addEventListener("click", e => {
    const card = e.target.closest(".hero-card");
    if (card && !e.target.classList.contains('favorite-heart') && !e.target.classList.contains('compare-check')) {
        const heroId = Number(card.dataset.id);
        showHeroDetail(heroId);
    }
});

// ===============================
// INISIALISASI AWAL
// ===============================
fetchHeroes();