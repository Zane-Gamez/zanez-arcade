let appsData = [];
let currentPage = 1;
const itemsPerPage = 24;
let filteredGames = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function fetchGames() {
  try {
    const timestamp = Date.now();
    const [zaneRes, hydraRes, ugsRes] = await Promise.all([
      fetch(`https://cdn.jsdelivr.net/npm/@arcade-v/arcade_v/navigation/games/games.json?_=${timestamp}`, { cache: 'no-store' }).catch(() => null),
      fetch(`https://cdn.jsdelivr.net/gh/1234chromebook1234-creator/hh@main/gmes.json?_=${timestamp}`, { cache: 'no-store' }).catch(() => null),
      fetch(`https://cdn.jsdelivr.net/gh/bubbls/ugs-singlefile@main/games.js?_=${timestamp}`, { cache: 'no-store' }).catch(() => null)
    ]);

    let zaneGames = [];
    if (zaneRes && zaneRes.ok) {
      const zaneData = await zaneRes.json();
      zaneGames = zaneData.map(game => ({ ...game, engine: 'zane' }));
    }

    let hydraGames = [];
    if (hydraRes && hydraRes.ok) {
      const hydraData = await hydraRes.json();
      hydraGames = hydraData.map(game => ({
        title: game.title,
        image: `https://cdn.jsdelivr.net/gh/1234chromebook1234-creator/hh@main/${game.thumb}`,
        engine: 'hydra',
        url: `https://cdn.jsdelivr.net/gh/1234chromebook1234-creator/hh@main/gmes/${game.file_name}`,
        mode: 'RAW_FETCH'
      }));
    }

    let ugsGames = [];
    if (ugsRes && ugsRes.ok) {
      const ugsText = await ugsRes.text();
      const match = ugsText.match(/let\s+files\s*=\s*\[([\s\S]*?)\];/);
      
      if (match && match[1]) {
        const fileNames = match[1]
          .split(',')
          .map(s => s.trim().replace(/['"]/g, ''))
          .filter(s => s.length > 0);

        ugsGames = fileNames.map(f => {
          let displayTitle = f;
          if (displayTitle.toLowerCase().startsWith("cl")) {
            displayTitle = displayTitle.substring(2);
          }
          const isHtml = f.includes(".") && f.lastIndexOf(".") > 0;
          const fileName = isHtml ? f : f + ".html";

          return {
            title: displayTitle,
            image: 'https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/5968517.png',
            engine: 'ugs',
            url: `https://cdn.jsdelivr.net/gh/bubbls/ugs-singlefile/UGS-Files/${encodeURIComponent(fileName)}`,
            mode: 'RAW_FETCH'
          };
        });
      }
    }

    appsData = [...zaneGames, ...hydraGames, ...ugsGames];
    filteredGames = [...appsData];
    renderPage();
  } catch (error) {
    const gameButtons = document.getElementById('gameButtons');
    if (gameButtons) {
      gameButtons.innerHTML = '<p>Failed to load games. Please try again.</p>';
    }
  }
}

fetchGames();

function renderPage() {
  const container = document.getElementById('gameButtons');
  container.innerHTML = '';
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredGames.slice(startIndex, endIndex);

  if (currentItems.length === 0) {
    currentPage = 1;
    const fallbackItems = filteredGames.slice(0, itemsPerPage);
    
    if (fallbackItems.length === 0) {
      container.innerHTML = '<p>No games found.</p>';
      document.getElementById('paginationControls').innerHTML = '';
      return;
    }
    
    renderGameCards(fallbackItems, container);
    renderPaginationControls();
    return;
  }

  renderGameCards(currentItems, container);
  renderPaginationControls();
}

function renderGameCards(items, container) {
  items.forEach(game => {
    const btn = document.createElement('div');
    btn.className = 'game-button';
    const isFav = favorites.includes(game.title);
    const star = isFav ? '⭐' : '☆';
    let clickAction = '';
    
    if (Array.isArray(game.functions)) {
      clickAction = game.functions.map(func => {
        const params = func.params.map(p => "'" + p + "'").join(',');
        return func.name + '(' + params + ')';
      }).join(';');
    } else {
      clickAction = `handleGameClick('${game.url}', '${game.mode}')`;
    }
    
    btn.innerHTML = `
      <button onclick="${clickAction}" aria-label="${game.title}">
        <img src="${game.image}" alt="${game.title}" loading="lazy">
      </button>
      <p class="game-title">
        ${game.title}
        <span class="favorite-icon" onclick="toggleFavorite('${game.title}')">${star}</span>
      </p>
    `;
    container.appendChild(btn);
  });
}

function applyFilters() {
  const searchVal = document.getElementById('searchBar').value.toLowerCase();
  const categoryVal = document.getElementById('categorySelect').value;
  const showFavs = document.getElementById('showFavorites').checked;

  filteredGames = appsData.filter(game => {
    const titleMatch = game.title.toLowerCase().includes(searchVal);
    const engineMatch = categoryVal === 'All' || game.engine === categoryVal;
    const favMatch = !showFavs || favorites.includes(game.title);
    
    return titleMatch && engineMatch && favMatch;
  });
  
  currentPage = 1;
  renderPage();
}

function renderPaginationControls() {
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const paginationContainer = document.getElementById('paginationControls');
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    
    if (i === currentPage) {
      btn.classList.add('active-page');
    }
    
    btn.onclick = () => {
      currentPage = i;
      renderPage();
    };
    
    paginationContainer.appendChild(btn);
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleFavorite(title) {
  if (favorites.includes(title)) {
    favorites = favorites.filter(fav => fav !== title);
  } else {
    favorites.push(title);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderPage();
}

function handleGameClick(url, mode) {
  if (mode === 'A') {
    loadBlobContent(url);
  } else if (mode === 'B') {
    changePageContent(url);
  } else if (mode === 'RAW_FETCH') {
    fetch(url + '?t=' + Date.now())
      .then((response) => response.text())
      .then((text) => {
        const newWin = window.open("about:blank", "_blank");
        if (newWin) {
          newWin.document.open();
          newWin.document.write(text);
          newWin.document.close();
        }
      });
  } else {
    loadBlobContent(url);
  }
}

