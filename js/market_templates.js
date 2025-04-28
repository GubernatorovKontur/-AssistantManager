// /js/market_templates.js
console.log('Script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    const emailContent = document.getElementById('email-content');
    const greetingPreview = document.getElementById('greeting-preview');
    const purposePreview = document.getElementById('purpose-preview');
    const tariffsPreview = document.getElementById('tariffs-preview');
    const monoTariffsPreview = document.getElementById('mono-tariffs-preview');
    const upgradePreview = document.getElementById('upgrade-preview');
    const costPreview = document.getElementById('cost-preview');
    const greetingOptions = document.getElementById('greeting-options');
    const purposeOptions = document.getElementById('purpose-options');
    const tariffsOptions = document.getElementById('tariffs-options');
    const monoTariffsOptions = document.getElementById('mono-tariffs-options');
    const stateSystemsOptions = document.getElementById('state-systems-options');
    const costOptions = document.getElementById('cost-options');
    const upgradeOptions = document.getElementById('upgrade-options');
    const importButton = document.querySelector('.import-button .btn');
    const resetButton = document.querySelector('.reset-button .btn');
    const copyButton = document.querySelector('.copy-button .btn');
    const costDateSelect = document.getElementById('cost-date-select');

    console.log('emailContent:', emailContent);
    console.log('greetingPreview:', greetingPreview);
    console.log('purposePreview:', purposePreview);
    console.log('tariffsPreview:', tariffsPreview);
    console.log('monoTariffsPreview:', monoTariffsPreview);
    console.log('upgradePreview:', upgradePreview);
    console.log('costPreview:', costPreview);
    console.log('importButton:', importButton);
    console.log('resetButton:', resetButton);
    console.log('copyButton:', copyButton);
    console.log('costDateSelect:', costDateSelect);

    let tariffHeaderAdded = false;
    let texts = {};

    fetch('/data/market_templates.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load market_templates.json');
            return response.json();
        })
        .then(data => {
            console.log('JSON loaded:', data);
            texts = data;
            renderOptions();
            bindEvents();
        })
        .catch(err => console.error('Error loading JSON:', err));

    function renderOptions() {
        if (!greetingOptions || !tariffsOptions || !monoTariffsOptions || !stateSystemsOptions || !upgradeOptions) {
            console.error('One or more option containers are missing');
            return;
        }

        const greetingHtml = texts.greetings.map(g => `
            <label><input type="checkbox" data-greeting="${g.id}"> ${g.label}</label><br>
        `).join('');
        greetingOptions.querySelector('.content').innerHTML = greetingHtml;

        const tariffsHtml = texts.tariffs.map(t => `
            <label><input type="checkbox" data-tariff="${t.id}"> ${t.label}</label><br>
        `).join('');
        tariffsOptions.querySelector('.content').innerHTML = tariffsHtml;

        const monoTariffsHtml = texts.monoTariffs.map(mt => `
            <label><input type="checkbox" data-mono-tariff="${mt.id}"> ${mt.label}</label><br>
        `).join('');
        monoTariffsOptions.querySelector('.content').innerHTML = monoTariffsHtml;

        const stateSystemsHtml = texts.stateSystems.map(ss => `
            <label><input type="checkbox" data-state-system="${ss.id}"> ${ss.label}</label><br>
        `).join('');
        stateSystemsOptions.querySelector('.content').innerHTML = stateSystemsHtml;

        const upgradesHtml = texts.upgrades.map(u => `
            <label><input type="checkbox" data-upgrade="${u.id}"> ${u.label}</label><br>
        `).join('');
        upgradeOptions.querySelector('.content').innerHTML = upgradesHtml;
    }

    function bindEvents() {
        greetingOptions.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox') {
                const greetingId = event.target.getAttribute('data-greeting');
                const greeting = texts.greetings.find(g => g.id === greetingId);
                if (event.target.checked) {
                    updateContent(greetingPreview, `greeting-${greetingId}`, `<p id="greeting-${greetingId}">${greeting.text}</p>`);
                } else {
                    const element = document.getElementById(`greeting-${greetingId}`);
                    if (element) element.remove();
                }
            }
        });

        purposeOptions.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox') {
                const purposeType = event.target.getAttribute('data-purpose');
                let content = '';
                if (event.target.checked) {
                    switch (purposeType) {
                        case 'renewal': 
                            const renewalDateInput = document.getElementById('renewal-date-input');
                            renewalDateInput.style.display = 'block';
                            const renewalDate = document.getElementById('renewal-date').value || '[дата]';
                            content = `<p id="purpose-renewal">Срок действия Контур.Маркета заканчивается ${renewalDate}. Чтобы не прерывать работу, продлите подписку — подробности ниже.</p>`; 
                            break;
                        case 'sale': 
                            content = `<p id="purpose-sale">Попробуйте Контур.Маркет: отчетность, товароучет, касса и управление бизнесом в одном. Удобно и просто — узнайте больше ниже!</p>`; 
                            break;
                        case 'info': 
                            content = `<p id="purpose-info">Вот немного о возможностях Контур.Маркета — они могут облегчить вашу работу. Подробности ниже!</p>`; 
                            break;
                    }
                    updateContent(purposePreview, `purpose-${purposeType}`, content);
                } else {
                    const element = document.getElementById(`purpose-${purposeType}`);
                    if (element) element.remove();
                    if (purposeType === 'renewal') {
                        document.getElementById('renewal-date-input').style.display = 'none';
                    }
                }
            }
        });

        document.getElementById('renewal-date').addEventListener('input', function(e) {
            const renewalChecked = document.querySelector('[data-purpose="renewal"]').checked;
            if (renewalChecked) {
                let value = this.value.replace(/\D/g, '');
                if (value.length > 2) value = value.slice(0, 2) + '.' + value.slice(2);
                if (value.length > 5) value = value.slice(0, 5) + '.' + value.slice(5);
                if (value.length > 10) value = value.slice(0, 10);
                this.value = value;
                const renewalDate = this.value || '[дата]';
                updateContent(purposePreview, 'purpose-renewal', `<p id="purpose-renewal">Срок действия Контур.Маркета заканчивается ${renewalDate}. Чтобы не прерывать работу, продлите подписку — подробности ниже.</p>`);
            }
        });

        tariffsOptions.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox') {
                const tariffId = event.target.getAttribute('data-tariff');
                const tariff = texts.tariffs.find(t => t.id === tariffId);
                if (event.target.checked) {
                    addTariffHeader();
                    updateContent(tariffsPreview, `tariff-${tariffId}`, `<p id="tariff-${tariffId}">${tariff.text}</p>`);
                } else {
                    const element = document.getElementById(`tariff-${tariffId}`);
                    if (element) element.remove();
                    removeTariffHeaderIfEmpty();
                }
            }
        });

        monoTariffsOptions.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox') {
                const monoTariffId = event.target.getAttribute('data-mono-tariff');
                const monoTariff = texts.monoTariffs.find(mt => mt.id === monoTariffId);
                if (event.target.checked) {
                    addTariffHeader();
                    updateContent(monoTariffsPreview, `mono-${monoTariffId}`, `<p id="mono-${monoTariffId}">${monoTariff.text}</p>`);
                } else {
                    const element = document.getElementById(`mono-${monoTariffId}`);
                    if (element) element.remove();
                    removeTariffHeaderIfEmpty();
                }
            }
        });

        stateSystemsOptions.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox') {
                const stateSystemId = event.target.getAttribute('data-state-system');
                const stateSystem = texts.stateSystems.find(ss => ss.id === stateSystemId);
                if (event.target.checked) {
                    addTariffHeader();
                    updateContent(monoTariffsPreview, `state-${stateSystemId}`, `<p id="state-${stateSystemId}">${stateSystem.text}</p>`);
                } else {
                    const element = document.getElementById(`state-${stateSystemId}`);
                    if (element) element.remove();
                    removeTariffHeaderIfEmpty();
                }
            }
        });

        upgradeOptions.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox') {
                const upgradeId = event.target.getAttribute('data-upgrade');
                const upgrade = texts.upgrades.find(u => u.id === upgradeId);
                if (event.target.checked) {
                    updateContent(upgradePreview, `upgrade-${upgradeId}`, `<p id="upgrade-${upgradeId}">${upgrade.text}</p>`);
                } else {
                    const element = document.getElementById(`upgrade-${upgradeId}`);
                    if (element) element.remove();
                }
            }
        });

        costOptions.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox' || event.target.tagName === 'SELECT') {
                const costType = event.target.getAttribute('data-cost');
                if (event.target.type === 'checkbox') {
                    const inputsDiv = document.getElementById(`${costType}-inputs`);
                    if (event.target.checked) {
                        inputsDiv.style.display = 'block';
                    } else {
                        inputsDiv.style.display = 'none';
                        const element = document.getElementById(`cost-${costType}`);
                        if (element) element.remove();
                    }
                }
                updateCostText();
            }
        });

        document.querySelectorAll('.cost-inputs input, .cost-inputs select, #cost-date').forEach(input => {
            input.addEventListener('input', updateCostText);
        });

        const coll = document.getElementsByClassName("collapsible");
        for (let i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function() {
                this.classList.toggle("active");
                const content = this.nextElementSibling;
                if (content.style.display === "block") {
                    content.style.display = "none";
                } else {
                    content.style.display = "block";
                }
            });
        }

        importButton.addEventListener('click', importFromClipboard);
        resetButton.addEventListener('click', resetAll);
        copyButton.addEventListener('click', copyEmailContent);
        costDateSelect.addEventListener('change', setCostDate);
    }

    function updateContent(container, id, content) {
        if (!container) {
            console.error(`Container for ${id} is null`);
            return;
        }
        const existingElement = document.getElementById(id);
        if (existingElement) {
            existingElement.innerHTML = content.replace(`id="${id}"`, '');
        } else {
            container.insertAdjacentHTML('beforeend', content);
        }
    }

    function addTariffHeader() {
        if (!tariffHeaderAdded && tariffsPreview) {
            tariffsPreview.insertAdjacentHTML('beforeend', `<p id="tariff-header">Ваш Контур.Маркет:</p>`);
            tariffHeaderAdded = true;
        }
    }

    function removeTariffHeaderIfEmpty() {
        if (!tariffsPreview || !monoTariffsPreview) return;
        const tariffItems = tariffsPreview.querySelectorAll('p:not(#tariff-header)').length;
        const monoItems = monoTariffsPreview.querySelectorAll('p').length;
        const stateItems = monoTariffsPreview.querySelectorAll('p[id^="state-"]').length;
        if (tariffItems === 0 && monoItems === 0 && stateItems === 0) {
            const header = document.getElementById('tariff-header');
            if (header) header.remove();
            tariffHeaderAdded = false;
        }
    }

    function updateCostText() {
        if (!costPreview) {
            console.error('costPreview is null');
            return;
        }
        const oneYearChecked = document.querySelector('[data-cost="one-year"]').checked;
        const twoYearsChecked = document.querySelector('[data-cost="two-years"]').checked;
        const threeYearsChecked = document.querySelector('[data-cost="three-years"]').checked;
        const date = document.getElementById('cost-date').value;

        let content = '';
        let count = 0;

        if (oneYearChecked || twoYearsChecked || threeYearsChecked) {
            content += `<p id="cost-intro">Варианты счетов для оплаты с учетом индивидуальных условий.</p>`;
        }

        if (oneYearChecked) {
            const invoice = document.getElementById('one-year-invoice').value;
            const price = document.getElementById('one-year-price').value;
            const discount = document.getElementById('one-year-discount').value;
            const gift = document.getElementById('one-year-gift').value;
            count++;
            content += `<p id="cost-one-year">${count}. Счет на 12 мес. ${invoice || '[номер счета]'} - ${price || '[стоимость]'} руб.${discount ? ` скидка ${discount}%` : ''}${gift ? ` ${gift} месяцев в подарок` : ''}</p>`;
        }

        if (twoYearsChecked) {
            const invoice = document.getElementById('two-years-invoice').value;
            const price = document.getElementById('two-years-price').value;
            const discount = document.getElementById('two-years-discount').value;
            const gift = document.getElementById('two-years-gift').value;
            count++;
            content += `<p id="cost-two-years">${count}. Счет на 24 мес. ${invoice || '[номер счета]'} - ${price || '[стоимость]'} руб.${discount ? ` скидка ${discount}%` : ''}${gift ? ` ${gift} месяцев в подарок` : ''}</p>`;
        }

        if (threeYearsChecked) {
            const invoice = document.getElementById('three-years-invoice').value;
            const price = document.getElementById('three-years-price').value;
            const discount = document.getElementById('three-years-discount').value;
            const gift = document.getElementById('three-years-gift').value;
            count++;
            content += `<p id="cost-three-years">${count}. Счет на 36 мес. ${invoice || '[номер счета]'} - ${price || '[стоимость]'} руб.${discount ? ` скидка ${discount}%` : ''}${gift ? ` ${gift} месяцев в подарок` : ''}</p>`;
        }

        if ((oneYearChecked || twoYearsChecked || threeYearsChecked) && date) {
            content += `<p id="cost-date-end">Счета действительны до ${date}</p>`;
        }

        costPreview.innerHTML = content;
    }

    function setCostDate() {
        const selectedDays = document.getElementById('cost-date-select').value;
        if (!selectedDays) return;

        const today = new Date();
        const futureDate = new Date(today.setDate(today.getDate() + parseInt(selectedDays)));
        const day = String(futureDate.getDate()).padStart(2, '0');
        const month = String(futureDate.getMonth() + 1).padStart(2, '0');
        const year = futureDate.getFullYear();
        document.getElementById('cost-date').value = `${day}.${month}.${year}`;
        updateCostText();
    }

    function copyEmailContent() {
        if (!emailContent) {
            console.error('emailContent is null');
            return;
        }
        const emailText = emailContent.innerText;
        navigator.clipboard.writeText(emailText)
            .then(() => alert("Содержимое письма скопировано!"))
            .catch(err => console.error('Failed to copy:', err));
    }

    function resetAll() {
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
        });
        document.querySelectorAll('.cost-inputs select').forEach(select => {
            select.value = '';
        });
        document.querySelectorAll('.cost-inputs').forEach(div => {
            div.style.display = 'none';
        });
        document.getElementById('renewal-date-input').style.display = 'none';
        greetingPreview.innerHTML = '';
        purposePreview.innerHTML = '';
        tariffsPreview.innerHTML = '';
        monoTariffsPreview.innerHTML = '';
        upgradePreview.innerHTML = '';
        costPreview.innerHTML = '';
        tariffHeaderAdded = false;
    }

    function importFromClipboard() {
        resetAll();
        navigator.clipboard.readText().then(text => {
            const lines = text.split('\n');
            let term = 'one-year';

            lines.forEach(line => {
                line = line.trim().replace(/[,.]/g, ' ').replace(/\s+/g, ' ');
                let tariff = null;
                let monoTariff = null;

                if (line.includes('Общепит Базовый')) tariff = 'catering-basic';
                else if (line.includes('Общепит Оптимальный')) tariff = 'catering-optimal';
                else if (line.includes('Общепит Премиум')) tariff = 'catering-premium';
                else if (line.includes('Розница Базовый')) tariff = 'retail-basic';
                else if (line.includes('Розница Оптимальный')) tariff = 'retail-optimal';
                else if (line.includes('Розница Премиум')) tariff = 'retail-premium';
                else if (line.includes('Услуги Базовый')) tariff = 'services-basic';
                else if (line.includes('Услуги Оптимальный')) tariff = 'services-optimal';
                else if (line.includes('Услуги Премиум')) tariff = 'services-premium';
                else if (line.includes('Тарифный модификатор Маркировка') || line.includes('Маркировка')) monoTariff = 'marking';
                else if (line.includes('ЕГАИС')) monoTariff = 'egais';
                else if (line.includes('Росалкогольрегулирование') || line.includes('Росалкорегулирование')) monoTariff = 'rosalko';
                else if (line.includes('Тарифный модификатор Меркурий') || line.includes('Меркурий')) monoTariff = 'mercury';

                if (line.match(/36 мес/i) || line.match(/3 года/i)) term = 'three-years';
                else if (line.match(/24 мес/i) || line.match(/2 года/i)) term = 'two-years';
                else if (line.match(/12 мес/i) || line.match(/1 год/i)) term = 'one-year';

                if (tariff) {
                    const checkbox = document.querySelector(`[data-tariff="${tariff}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        tariffsOptions.dispatchEvent(new Event('change'));
                    }
                }

                if (monoTariff) {
                    const checkbox = document.querySelector(`[data-mono-tariff="${monoTariff}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        monoTariffsOptions.dispatchEvent(new Event('change'));
                    }
                }
            });

            const costCheckbox = document.querySelector(`[data-cost="${term}"]`);
            if (costCheckbox) {
                costCheckbox.checked = true;
                document.getElementById(`${term}-inputs`).style.display = 'block';
                updateCostText();
            }
        }).catch(err => {
            alert('Не удалось получить данные из буфера обмена: ' + err);
        });
    }
});