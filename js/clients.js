// /js/clients.js
document.addEventListener('DOMContentLoaded', () => {
    const categoryList = document.getElementById('category-list');
    const categoryContent = document.getElementById('category-content');
    const addNoteBtn = document.getElementById('add-note-btn');
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modal-close');
    const modalForm = document.getElementById('modal-form');
    const modalCategory = document.getElementById('modal-category');
    const modalText = document.getElementById('modal-text');

    const defaultNotes = {
        'market': {
            description: 'Советник помогает менеджерам по продажам быстро найти ключевую информацию для работы с клиентами. Каждый раздел содержит описание тарифов, советы по их продаже и дополнительные предложения для увеличения сделки. Всё о продажах Контур.Маркета: тарифы, выгоды, советы по продвижению и дополнительные услуги для клиентов. ',
            items: [
                'Тариф "Базовый": касса, учет блюд, техкарты – для малого кафе. Продавайте удобство и экономию времени.',
                'Тариф "Оптимальный": добавляет аналитику и доставку – для роста бизнеса. Упор на эффективность.',
                'Тариф "Премиум": полный учет, QR-меню, поддержка – для сетей. Акцент на автоматизацию.'
            ]
        },
        'ofd-uvn': {
            description: 'Информация по продажам ОФД и услуг внедрения: тарифы, аргументы и что ещё предложить клиенту.',
            items: [
                'ОФД: базовая передача данных в ФНС – от 3000 руб./год. Просто и надёжно.',
                'Услуги внедрения: настройка оборудования и обучение – от 5000 руб. Упор на скорость подключения.'
            ]
        },
        'kep-alko-egais': {
            description: 'Продажи КЭП и ЕГАИС: тарифы, как убедить клиента и дополнительные возможности.',
            items: [
                'КЭП: электронная подпись для ЕГАИС и отчётности – от 2000 руб. Быстрое оформление.',
                'ЕГАИС: автоматизация алкоотчётности – от 4000 руб./год. Упор на снижение штрафов.'
            ]
        },
        'general': {
            description: 'Практические советы по продажам: тарифы, техники закрытия сделок и идеи для допродаж (будет добавлено позже).',
            items: [
                '// Пока пусто. В будущем: общие скрипты продаж, работа с возражениями, мотивация.'
            ]
        }
    };

    let customNotes = JSON.parse(localStorage.getItem('customNotes')) || {};

    const categories = [
        { id: 'market', title: 'Маркет' },
        { id: 'ofd-uvn', title: 'ОФД и УВН' },
        { id: 'kep-alko-egais', title: 'КЭПАлкоЕгаис' },
        { id: 'general', title: 'Общие рекомендации' }
    ];

    function saveNotes() {
        localStorage.setItem('customNotes', JSON.stringify(customNotes));
    }

    function renderCategories() {
        categoryList.innerHTML = '';
        categories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = category.title;
            li.dataset.id = category.id;
            li.addEventListener('click', () => {
                document.querySelectorAll('.sidebar li').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                renderContent(category.id);
            });
            categoryList.appendChild(li);
        });
        categoryList.firstChild.classList.add('active');
        renderContent(categories[0].id);
    }

    function renderContent(categoryId) {
        categoryContent.innerHTML = '';
        const categoryData = defaultNotes[categoryId] || { description: '', items: [] };
        const customItems = customNotes[categoryId] || [];

        const h3 = document.createElement('h3');
        h3.textContent = categories.find(c => c.id === categoryId).title;
        categoryContent.appendChild(h3);

        const descriptionP = document.createElement('p');
        descriptionP.textContent = categoryData.description;
        descriptionP.style.fontStyle = 'italic';
        categoryContent.appendChild(descriptionP);

        categoryData.items.forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            categoryContent.appendChild(p);
        });

        if (customItems.length > 0) {
            customItems.forEach(text => {
                const div = document.createElement('div');
                div.className = 'note';
                div.textContent = text;
                categoryContent.appendChild(div);
            });
        }
    }

    addNoteBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        modalText.value = '';
    });

    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = modalCategory.value;
        const text = modalText.value.trim();
        if (text) {
            if (!customNotes[category]) customNotes[category] = [];
            customNotes[category].push(text);
            saveNotes();
            renderContent(category);
            modal.style.display = 'none';
        }
    });

    renderCategories();
});