// /js/newbie_links.js
const groupList = document.getElementById('group-list');
const contentDiv = document.getElementById('content');
const searchInput = document.getElementById('search');
const searchResults = document.getElementById('search-results');

let data = {};
let favorites = JSON.parse(localStorage.getItem('newbieFavorites')) || [];
let currentGroup = "favorites";
let allLinks = [];

fetch('/data/links.json')
    .then(response => response.json())
    .then(loadedData => {
        data = loadedData;
        allLinks = Object.values(data).flat();
        renderGroups();
        renderSection(currentGroup);
    });

function saveFavorites() {
    localStorage.setItem('newbieFavorites', JSON.stringify(favorites));
}

function renderGroups() {
    groupList.innerHTML = '';
    Object.keys(data).forEach(group => {
        const li = document.createElement('li');
        li.setAttribute('data-section', group);
        li.textContent = group === "favorites" ? "Избранное" : group;
        if (group === currentGroup) li.classList.add('active');
        li.addEventListener('click', () => switchSection(group));
        li.addEventListener('touchstart', (e) => {
            e.preventDefault();
            switchSection(group);
        }, { passive: false });
        groupList.appendChild(li);
    });
}

function switchSection(sectionId) {
    currentGroup = sectionId;
    document.querySelectorAll('.sidebar li').forEach(i => i.classList.remove('active'));
    const selectedItem = document.querySelector(`.sidebar li[data-section="${sectionId}"]`);
    if (selectedItem) selectedItem.classList.add('active');
    renderSection(sectionId);
}

function renderSection(sectionId) {
    let links;
    if (sectionId === "favorites") {
        links = favorites.map(id => allLinks.find(link => link.id === id)).filter(link => link);
    } else {
        links = data[sectionId] || [];
    }
    let html = `<div id="${sectionId}" class="links-container visible">`;
    links.forEach(link => {
        html += `
            <div class="link-card" data-id="${link.id}">
                <div class="title"><i class="fas fa-link"></i> ${link.title}</div>
                <p>${link.desc}</p>
                <a href="${link.url}" target="_blank" class="btn" data-tooltip="${link.tooltip}">${link.url.includes('youtube') || link.url.includes('vimeo') ? 'Смотреть' : 'Перейти'}</a>
                <i class="fas fa-star favorite-btn ${favorites.includes(link.id) ? 'active' : ''}"></i>
                ${sectionId === 'favorites' ? `<span class="remove-favorite" data-id="${link.id}">Удалить</span>` : ''}
            </div>`;
    });
    html += '</div>';
    contentDiv.innerHTML = html;

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const card = btn.closest('.link-card');
        const id = card.getAttribute('data-id');
        btn.onclick = () => {
            if (favorites.includes(id)) {
                favorites = favorites.filter(fav => fav !== id);
                btn.classList.remove('active');
            } else {
                favorites.push(id);
                btn.classList.add('active');
            }
            saveFavorites();
            if (sectionId === 'favorites') renderSection('favorites');
        };
    });

    document.querySelectorAll('.remove-favorite').forEach(btn => {
        const id = btn.getAttribute('data-id');
        btn.onclick = () => {
            favorites = favorites.filter(fav => fav !== id);
            saveFavorites();
            renderSection('favorites');
        };
    });
}

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    searchResults.innerHTML = '';
    searchResults.style.display = 'none';

    if (query) {
        const matches = allLinks.filter(link => 
            link.title.toLowerCase().includes(query) ||
            link.desc.toLowerCase().includes(query) ||
            link.url.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            matches.forEach(match => {
                const result = document.createElement('div');
                result.innerHTML = `${match.title}<br><span class="path">${Object.keys(data).find(g => data[g].includes(match))}</span>`;
                result.addEventListener('click', () => {
                    window.open(match.url, '_blank');
                    searchResults.style.display = 'none';
                    searchInput.value = '';
                });
                searchResults.appendChild(result);
            });
            searchResults.style.display = 'block';
        }
    }
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
    }
});