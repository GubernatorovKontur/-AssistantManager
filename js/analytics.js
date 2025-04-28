// /js/analytics.js
document.addEventListener('DOMContentLoaded', () => {
    const categoryList = document.getElementById('category-list');
    const categoryContent = document.getElementById('category-content');
    const addPaymentBtn = document.getElementById('add-payment-btn');
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modal-close');
    const modalForm = document.getElementById('modal-form');
    const modalInnKpp = document.getElementById('modal-inn-kpp');
    const modalName = document.getElementById('modal-name');
    const modalAmount = document.getElementById('modal-amount');
    const modalWeek = document.getElementById('modal-week');
    const modalStatus = document.getElementById('modal-status');

    const PLAN_GOAL = 100000; // Цель плана в рублях
    let payments = JSON.parse(localStorage.getItem('payments')) || [];
    let contacts = parseInt(localStorage.getItem('contacts')) || 0;

    const categories = [
        { id: 'metrics', title: 'Показатели' },
        { id: 'recommendations', title: 'Рекомендации' },
        { id: 'expected-payments', title: 'Ожидаемые оплаты' },
        { id: 'goals', title: 'Цели' },
        { id: 'gamification', title: 'Геймификация' }
    ];

    function saveData() {
        localStorage.setItem('payments', JSON.stringify(payments));
        localStorage.setItem('contacts', contacts);
    }

    function calculateMetrics() {
        const receivedPayments = payments.filter(p => p.status === 'received');
        const totalReceived = receivedPayments.reduce((sum, p) => sum + p.amount, 0);
        const avgCheck = receivedPayments.length ? (totalReceived / receivedPayments.length).toFixed(2) : 0;
        const efficiency = contacts ? ((receivedPayments.length / contacts) * 100).toFixed(2) : 0;
        const planCompletion = ((totalReceived / PLAN_GOAL) * 100).toFixed(2);
        return { avgCheck, efficiency, planCompletion, totalReceived };
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
        const h3 = document.createElement('h3');
        h3.textContent = categories.find(c => c.id === categoryId).title;
        categoryContent.appendChild(h3);

        const metrics = calculateMetrics();

        switch (categoryId) {
            case 'metrics':
                categoryContent.innerHTML += `
                    <p><strong>Средний чек:</strong> ${metrics.avgCheck} руб.</p>
                    <p><strong>Эффективность:</strong> ${metrics.efficiency}% (оплат/контактов)</p>
                    <p><strong>Выполнение плана:</strong> ${metrics.planCompletion}% (${metrics.totalReceived} / ${PLAN_GOAL} руб.)</p>
                `;
                break;
            case 'recommendations':
                categoryContent.innerHTML += `
                    <p>Сфокусируйтесь на крупных клиентах с высоким чеком.</p>
                    <p>Увеличьте количество контактов до 10 в день.</p>
                    <p>Предложите допуслуги для текущих лидов.</p>
                `;
                break;
            case 'expected-payments':
                const expectedTotal = payments.reduce((sum, p) => sum + (p.status === 'pending' ? p.amount : 0), 0);
                categoryContent.innerHTML += `
                    <p>Ожидаемые оплаты: ${expectedTotal} руб. (всего в пуле: ${payments.length})</p>
                    <table class="payment-table">
                        <thead>
                            <tr>
                                <th>ИНН-КПП</th>
                                <th>Название</th>
                                <th>Сумма (руб.)</th>
                                <th>Неделя</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.map(p => `
                                <tr class="${p.status}">
                                    <td>${p.innKpp}</td>
                                    <td>${p.name}</td>
                                    <td>${p.amount}</td>
                                    <td>${p.week}</td>
                                    <td>${p.status === 'received' ? 'Получена' : 'Ожидается'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                break;
            case 'goals':
                const remaining = PLAN_GOAL - metrics.totalReceived;
                const contactCost = contacts ? (PLAN_GOAL / contacts).toFixed(2) : 0;
                categoryContent.innerHTML += `
                    <p><strong>Осталось до плана:</strong> ${remaining} руб.</p>
                    <p><strong>Стоимость контакта:</strong> ${contactCost} руб.</p>
                    <p>Цель: ещё ${Math.ceil(remaining / (metrics.avgCheck || 1))} оплат по среднему чеку.</p>
                    <p>Поработайте с ${Math.ceil(remaining / (contactCost || 1))} клиентами.</p>
                `;
                break;
            case 'gamification':
                const points = payments.filter(p => p.status === 'received').length * 10;
                categoryContent.innerHTML += `
                    <p>Очки за оплаты: ${points} (10 очков за каждую полученную оплату).</p>
                    <p>Цель: наберите 100 очков для бонуса!</p>
                `;
                break;
        }
    }

    addPaymentBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        modalInnKpp.value = '';
        modalName.value = '';
        modalAmount.value = '';
        modalWeek.value = '1';
        modalStatus.value = 'pending';
        contacts++; // Увеличиваем счётчик контактов
        saveData();
    });

    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const payment = {
            innKpp: modalInnKpp.value.trim(),
            name: modalName.value.trim(),
            amount: parseInt(modalAmount.value),
            week: modalWeek.value,
            status: modalStatus.value
        };
        payments.push(payment);
        saveData();
        renderContent('expected-payments');
        modal.style.display = 'none';
    });

    renderCategories();
});