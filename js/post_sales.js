// /js/post_sales.js
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
        'communication': {
            description: 'Как эффективно работать с коллегами из других отделов: правила, контакты и советы.',
            items: [
                'Пишите в общий чат: кратко укажите задачу и дедлайн.',
                'Контакты: техподдержка – support@kontur.ru, внедрение – setup@kontur.ru.',
                'Совет: уточняйте приоритет задачи, чтобы ускорить обработку.'
            ]
        },
        'incidents': {
            description: 'Процесс обработки инцидентов: как фиксировать, передавать и отслеживать решение.',
            items: [
                '1. Зафиксируйте проблему: имя клиента, описание, время.',
                '2. Передайте в техподдержку через форму или чат.',
                '3. Уточните номер тикета и сообщите клиенту сроки.'
            ]
        },
        'lead-to-service': {
            description: 'Чек-лист для передачи лида в сервисный центр: что уточнить и как оформить.',
            items: [
                'Чек-лист: имя клиента, телефон, описание потребности, бюджет.',
                'Оформление: отправьте в CRM с пометкой "Сервисный центр".',
                'Совет: предупредите клиента о сроках обратной связи – 1-2 дня.'
            ]
        },
        'implementation-email': {
            description: 'Шаблон письма для передачи задач на внедрение: структура и ключевые моменты.',
            items: [
                'Тема: Запрос на внедрение для клиента [Имя].',
                'Текст: "Коллеги, прошу настроить [услугу] для клиента [имя]. Данные: [телефон, описание]. Дедлайн: [дата]."',
                'Совет: приложите скриншоты или документы, если есть.'
            ]
        },
        'special-cases': {
            description: 'Готовые шаблоны для тендеров и бюджетных организаций: как оформить и что учесть.',
            items: [
                'Тендеры: "Предлагаем [тариф] за [цена]. Условия: [сроки, гарантии]. Контакт: [телефон]."',
                'Бюджетные организации: "Предложение для [название]: [тариф] за [цена], оплата по счёту, отсрочка до 30 дней."'
            ]
        }
    };

    let customNotes = JSON.parse(localStorage.getItem('customPostSalesNotes')) || {};

    const categories = [
        { id: 'communication', title: 'Общение с подразделениями' },
        { id: 'incidents', title: 'Работа с инцидентами' },
        { id: 'lead-to-service', title: 'Передать лид в сервисный центр' },
        { id: 'implementation-email', title: 'Отправить письмо на внедрение' },
        { id: 'special-cases', title: 'Шаблоны для спецкейсов' }
    ];

    function saveNotes() {
        localStorage.setItem('customPostSalesNotes', JSON.stringify(customNotes));
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