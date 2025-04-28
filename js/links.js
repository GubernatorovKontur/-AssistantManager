// /js/links.js
console.log('Script started loading...');

const groupList = document.getElementById('group-list');
const contentDiv = document.getElementById('content');
const searchInput = document.getElementById('search');
const searchResults = document.getElementById('search-results');
const addGroupBtn = document.getElementById('add-group-btn');
const addLinkBtn = document.getElementById('add-link-btn');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalForm = document.getElementById('modal-form');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalUrl = document.getElementById('modal-url');
const modalId = document.getElementById('modal-id');

let data = JSON.parse(localStorage.getItem('linksData')) || {
    groups: { "Избранное": [] },
    favorites: []
};
let currentGroup = "Избранное";
let allLinks = [];

function saveData() {
    console.log('Saving data to localStorage...');
    localStorage.setItem('linksData', JSON.stringify(data));
    allLinks = Object.values(data.groups).flat();
}

function renderGroups() {
    console.log('Rendering groups...');
    groupList.innerHTML = '';
    Object.keys(data.groups).forEach(group => {
        const li = document.createElement('li');
        li.setAttribute('data-section', group);
        li.textContent = group;
        if (group === currentGroup) li.classList.add('active');
        if (group !== "Избранное") {
            const editBtn = document.createElement('i');
            editBtn.className = 'fas fa-edit edit-group-btn';
            editBtn.onclick = () => editGroup(group);
            li.appendChild(editBtn);

            const deleteBtn = document.createElement('i');
            deleteBtn.className = 'fas fa-trash delete-group-btn';
            deleteBtn.onclick = () => deleteGroup(group);
            li.appendChild(deleteBtn);
        }
        groupList.appendChild(li);
    });

    document.querySelectorAll('.sidebar li').forEach(item => {
        item.onclick = null; // Убираем старые обработчики
        const sectionId = item.getAttribute('data-section');
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('edit-group-btn') && !e.target.classList.contains('delete-group-btn')) {
                console.log(`Switching to section: ${sectionId}`);
                switchSection(sectionId);
            }
        });
        item.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!e.target.classList.contains('edit-group-btn') && !e.target.classList.contains('delete-group-btn')) {
                console.log(`Touch switching to section: ${sectionId}`);
                switchSection(sectionId);
            }
        }, { passive: false });
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
    console.log(`Rendering section: ${sectionId}`);
    let links;
    if (sectionId === "Избранное") {
        links = data.favorites.map(id => allLinks.find(link => link.id === id)).filter(link => link);
    } else {
        links = data.groups[sectionId] || [];
    }
    let html = `<div id="${sectionId}" class="links-container visible">`;
    links.forEach(link => {
        html += `
            <div class="link-card" data-id="${link.id}">
                <div class="title"><i class="fas fa-link"></i> ${link.title}</div>
                <p>${link.desc}</p>
                <a href="${link.url}" target="_blank" class="btn" data-tooltip="${link.url}">${link.url.includes('youtube') || link.url.includes('vimeo') ? 'Смотреть' : 'Перейти'}</a>
                <i class="fas fa-star favorite-btn ${data.favorites.includes(link.id) ? 'active' : ''}"></i>
                <i class="fas fa-edit edit-link-btn"></i>
                <i class="fas fa-trash delete-link-btn"></i>
                ${sectionId === 'Избранное' ? `<span class="remove-favorite" data-id="${link.id}">Удалить</span>` : ''}
            </div>`;
    });
    html += '</div>';
    contentDiv.innerHTML = html;

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const card = btn.closest('.link-card');
        const id = card.getAttribute('data-id');
        btn.addEventListener('click', () => {
            console.log(`Favorite clicked for ID: ${id}`);
            if (data.favorites.includes(id)) {
                data.favorites = data.favorites.filter(fav => fav !== id);
                btn.classList.remove('active');
            } else {
                data.favorites.push(id);
                btn.classList.add('active');
            }
            saveData();
            if (sectionId === 'Избранное') renderSection('Избранное');
        });
    });

    document.querySelectorAll('.edit-link-btn').forEach(btn => {
        const card = btn.closest('.link-card');
        const id = card.getAttribute('data-id');
        btn.addEventListener('click', () => {
            console.log(`Edit link clicked for ID: ${id}`);
            editLink(id, sectionId);
        });
    });

    document.querySelectorAll('.delete-link-btn').forEach(btn => {
        const card = btn.closest('.link-card');
        const id = card.getAttribute('data-id');
        btn.addEventListener('click', () => {
            console.log(`Delete link clicked for ID: ${id}`);
            deleteLink(id, sectionId);
        });
    });

    document.querySelectorAll('.remove-favorite').forEach(btn => {
        const id = btn.getAttribute('data-id');
        btn.addEventListener('click', () => {
            console.log(`Remove favorite clicked for ID: ${id}`);
            data.favorites = data.favorites.filter(fav => fav !== id);
            saveData();
            renderSection('Избранное');
        });
    });
}

function showModal(type, group = null, link = null) {
    console.log(`showModal called with type: ${type}, group: ${group}, link: ${link ? link.id : 'none'}`);
    if (type === 'link' && !group) return;
    modal.style.display = 'block'; // Показываем модальное окно
    modal.classList.remove('hidden');
    modalTitle.value = link ? link.title : (group || '');
    modalDesc.value = link ? link.desc : '';
    modalUrl.value = link ? link.url : '';
    modalId.value = link ? link.id : (group || '');
    modalForm.dataset.type = type;
    modalForm.dataset.group = group || '';
    if (type === 'group') {
        modalDesc.style.display = 'none';
        modalUrl.style.display = 'none';
        modalTitle.focus();
    } else {
        modalDesc.style.display = 'block';
        modalUrl.style.display = 'block';
        modalTitle.focus();
    }
}

function hideModal() {
    console.log('hideModal called');
    modal.style.display = 'none'; // Скрываем модальное окно
    modal.classList.add('hidden');
    modalForm.reset();
    delete modalForm.dataset.type;
    delete modalForm.dataset.group;
}

// Привязка событий
addGroupBtn.addEventListener('click', () => {
    console.log('Add group button clicked');
    showModal('group');
});

addLinkBtn.addEventListener('click', () => {
    console.log('Add link button clicked');
    showModal('link', currentGroup);
});

modalClose.addEventListener('click', () => {
    console.log('Close button clicked');
    hideModal();
});

modalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Form submitted');
    const type = modalForm.dataset.type;
    const group = modalForm.dataset.group;
    const id = modalId.value || Date.now().toString();
    const newData = {
        id,
        title: modalTitle.value,
        desc: modalDesc.value,
        url: modalUrl.value || '#'
    };

    if (type === 'group') {
        if (!data.groups[newData.title]) {
            data.groups[newData.title] = [];
        } else if (group && group !== newData.title) {
            data.groups[newData.title] = data.groups[group];
            delete data.groups[group];
        }
    } else if (type === 'link') {
        const existingLinkIndex = data.groups[group].findIndex(l => l.id === id);
        if (existingLinkIndex >= 0) {
            data.groups[group][existingLinkIndex] = newData;
        } else {
            data.groups[group].push(newData);
        }
    }

    saveData();
    renderGroups();
    renderSection(currentGroup);
    hideModal();
});

function editGroup(group) {
    console.log(`Editing group: ${group}`);
    showModal('group', group);
}

function deleteGroup(group) {
    if (confirm(`Удалить группу "${group}" и все её ссылки?`)) {
        console.log(`Deleting group: ${group}`);
        delete data.groups[group];
        data.favorites = data.favorites.filter(id => !data.groups[group]?.some(l => l.id === id));
        saveData();
        currentGroup = "Избранное";
        renderGroups();
        renderSection(currentGroup);
    }
}

function editLink(id, group) {
    console.log(`Editing link ID: ${id} in group: ${group}`);
    const link = data.groups[group].find(l => l.id === id);
    showModal('link', group, link);
}

function deleteLink(id, group) {
    if (confirm('Удалить эту ссылку?')) {
        console.log(`Deleting link ID: ${id} from group: ${group}`);
        data.groups[group] = data.groups[group].filter(l => l.id !== id);
        data.favorites = data.favorites.filter(fav => fav !== id);
        saveData();
        renderSection(group);
    }
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
                result.innerHTML = `${match.title}<br><span class="path">${Object.keys(data.groups).find(g => data.groups[g].includes(match))}</span>`;
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

// Инициализация
console.log('Page loaded, initializing...');
modal.style.display = 'none'; // Явно скрываем модальное окно при старте
modal.classList.add('hidden');
saveData();
renderGroups();
renderSection(currentGroup);
console.log('Initialization complete, modal should be hidden');
console.log('Modal classList:', modal.classList.toString());
console.log('Modal style.display:', modal.style.display);