const API_URL = 'https://api.jikan.moe/v4/anime';

let allAnime = []; 
const animeGrid = document.getElementById('anime-grid');
const filterButtons = document.querySelectorAll('.btn-filter');

async function fetchAnime() {
    try {
        console.log("Запит іде на адресу:", API_URL);

        animeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #a8a8b3;">Завантаження каталогу...</p>';
        
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error(`Помилка сервера: ${response.status}`);
        
        const json = await response.json();
        allAnime = json.data; 

        renderAnime(allAnime); 
    } catch (error) {
        console.error('Не вдалося завантажити дані:', error);
        animeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff4757;">Помилка завантаження аніме. Спробуйте оновити сторінку.</p>';
    }
}

function renderAnime(animeList) {
    animeGrid.innerHTML = ''; 

    if (!animeList || animeList.length === 0) {
        animeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #a8a8b3;">Нічого не знайдено в цьому жанрі.</p>';
        return;
    }

    animeList.forEach(anime => {
        const searchTitle = anime.title_english || anime.title;
        
        const watchLink = `https://www.crunchyroll.com/search?q=${encodeURIComponent(searchTitle)}`;
        
        const card = document.createElement('div');
        card.className = 'anime-card';
        
        card.innerHTML = `
            <div style="height: 250px; overflow: hidden;">
                <img src="${anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}" alt="${anime.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 10px;">
                <div>
                    <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #fff;">${searchTitle}</h3>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #ff4757; font-weight: bold;">⭐️ ${anime.score || 'N/A'}</p>
                    <p class="anime-description" title="${anime.synopsis || ''}">${anime.synopsis || 'Опис відсутній.'}</p>
                </div>
                <a href="${watchLink}" target="_blank" class="btn-more">Дивитись</a>
            </div>
        `;
        animeGrid.appendChild(card);
    });
}

const genreMap = {
    'Екшн': 'Action',
    'Драма': 'Drama',
    'Сьонен': 'Adventure',
    'Фантастика': 'Fantasy',
    'Популярні': 'Popular',
};

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const selectedGenreUk = button.getAttribute('data-genre');

        if (selectedGenreUk === 'all') {
            renderAnime(allAnime); 
        } 
        
        else if (selectedGenreUk === 'Популярні') {
            const popularAnime = [...allAnime]
                .filter(anime => anime.popularity && anime.popularity > 0)
                .sort((a, b) => a.popularity - b.popularity);
                
            renderAnime(popularAnime);
        }
        
        else {
            const targetGenreEn = genreMap[selectedGenreUk];
            const filteredAnime = allAnime.filter(anime => {
                return anime.genres?.some(genre => genre.name === targetGenreEn);
            });
            renderAnime(filteredAnime); 
        }
    });
});

fetchAnime();