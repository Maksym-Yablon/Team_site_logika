const API_URL = 'https://api.jikan.moe/v4/anime';

let currentPage = 1;
let isLoading = false;
let hasMore = true;
let currentFilter = { type: 'all', value: null };

const animeGrid = document.getElementById('anime-grid');
const filterButtons = document.querySelectorAll('.btn-filter');

async function fetchAnime(append = false) {
    if (isLoading || !hasMore) return;

    isLoading = true;

    if (!append) {
        animeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">Завантаження каталогу...</p>';
        currentPage = 1;
    } else {
        const loader = document.createElement('div');
        loader.id = 'temp-loader';
        loader.style.gridColumn = '1/-1';
        loader.style.textAlign = 'center';
        loader.style.padding = '20px';
        loader.style.color = '#a8a8b3';
        loader.textContent = 'Завантаження...';
        animeGrid.appendChild(loader);
    }

    try {
        let url = `${API_URL}?page=${currentPage}&limit=25`;

        if (currentFilter.type === 'genre') {
            url += `&genres=${currentFilter.value}`;
        } else if (currentFilter.type === 'popular') {
            url += '&order_by=popularity&sort=asc';
        } else {
            url += '&order_by=score&sort=desc';
        }

        console.log(`Запит до API: ${url}`);
        const response = await fetch(url);

        if (!response.ok) throw new Error(`Помилка HTTP: ${response.status}`);

        const json = await response.json();
        const newAnime = json.data;

        document.getElementById('temp-loader')?.remove();

        if (!newAnime || newAnime.length === 0) {
            hasMore = false;
            if (!append && animeGrid.children.length === 0) {
                animeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Нічого не знайдено.</p>';
            }
            return;
        }

        renderAnime(newAnime);

        currentPage++;
        
        if (newAnime.length < 25) hasMore = false;

        if (hasMore) {
            renderLoadMoreButton();
        } else if (append) {
            const endMsg = document.createElement('p');
            endMsg.style.gridColumn = '1/-1';
            endMsg.style.textAlign = 'center';
            endMsg.style.color = '#a8a8b3';
            endMsg.style.padding = '20px';
            endMsg.textContent = 'Більше аніме в цьому списку немає.';
            animeGrid.appendChild(endMsg);
        }

    } catch (error) {
        console.error('Помилка завантаження:', error);
        document.getElementById('temp-loader')?.remove();
        
        const errorMsg = document.createElement('p');
        errorMsg.style.gridColumn = '1/-1';
        errorMsg.style.textAlign = 'center';
        errorMsg.style.color = '#ff4757';
        errorMsg.textContent = append ? 'Не вдалося довантажити. Спробуйте ще раз.' : 'Помилка завантаження даних.';
        animeGrid.appendChild(errorMsg);
    } finally {
        isLoading = false;
    }
}

function renderAnime(animeList) {
    animeList.forEach(anime => {
        const searchTitle = anime.title_english || anime.title;
        const watchLink = `https://www.crunchyroll.com/search?q=${encodeURIComponent(searchTitle)}`;
        const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

        const card = document.createElement('div');
        card.className = 'anime-card';
        
        card.innerHTML = `
            <div style="height: 250px; overflow: hidden; position: relative;">
                <img src="${imageUrl}" 
                     alt="${searchTitle}" 
                     style="width: 100%; height: 100%; object-fit: cover;" 
                     loading="lazy">
            </div>
            <div style="padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 10px;">
                <div>
                    <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #fff; line-height: 1.4;">${searchTitle}</h3>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #ff4757; font-weight: bold;">⭐️ ${anime.score ? anime.score.toFixed(1) : 'N/A'}</p>
                    <p class="anime-description" 
                       title="${anime.synopsis || ''}" 
                       style="font-size: 14px; color: #ccc; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5;">
                       ${anime.synopsis ? anime.synopsis.substring(0, 150) + '...' : 'Опис відсутній.'}
                    </p>
                </div>
                <a href="${watchLink}" target="_blank" class="btn-more" style="display:block; text-align:center; background:#ff4757; color:#fff; text-decoration:none; padding:10px; border-radius:4px; margin-top:10px;">Дивитись</a>
            </div>
        `;
        animeGrid.appendChild(card);
    });
}

function renderLoadMoreButton() {
    const oldBtn = document.getElementById('load-more-btn');
    if (oldBtn) oldBtn.remove();

    const btn = document.createElement('button');
    btn.id = 'load-more-btn';
    btn.textContent = 'Завантажити ще';
    btn.style.gridColumn = '1/-1';
    btn.style.padding = '15px';
    btn.style.marginTop = '20px';
    btn.style.background = '#333';
    btn.style.color = '#fff';
    btn.style.border = '1px solid #444';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '16px';
    btn.style.transition = 'background 0.3s';
    
    btn.onmouseover = () => btn.style.background = '#444';
    btn.onmouseout = () => btn.style.background = '#333';
    
    btn.onclick = () => fetchAnime(true);
    
    animeGrid.appendChild(btn);
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const genreId = button.getAttribute('data-genre');
        
        hasMore = true;
        isLoading = false;
        
        if (genreId === 'all') {
            currentFilter = { type: 'all', value: null };
        } else if (genreId === 'popular') {
            currentFilter = { type: 'popular', value: null };
        } else {
            currentFilter = { type: 'genre', value: genreId };
        }

        fetchAnime(false);
    });
});

if (animeGrid) {
    fetchAnime(false);
} else {
    console.error("Елемент 'anime-grid' не знайдено в DOM.");
}   