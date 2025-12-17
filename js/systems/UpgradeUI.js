/**
 * Пользовательский интерфейс системы прокачки
 * Космический Защитник
 */

class UpgradeUI {
    constructor(upgradeSystem) {
        this.upgradeSystem = upgradeSystem;
        this.isVisible = false;
        this.selectedUpgrade = null;
        this.createUI();
        this.setupEventListeners();
    }

    /**
     * Создание элементов интерфейса
     */
    createUI() {
        // Создание основного контейнера
        this.container = document.createElement('div');
        this.container.id = 'upgradeUI';
        this.container.className = 'upgrade-ui';
        this.container.style.display = 'none';
        
        // HTML структура
        this.container.innerHTML = `
            <div class="upgrade-panel">
                <div class="upgrade-header">
                    <h2>Улучшения</h2>
                    <div class="player-score">Очки: <span id="upgradeScore">0</span></div>
                    <button class="close-btn" id="closeUpgrades">×</button>
                </div>
                <div class="upgrade-content">
                    <div class="upgrade-list" id="upgradeList">
                        <!-- Список улучшений будет добавлен динамически -->
                    </div>
                    <div class="upgrade-details" id="upgradeDetails">
                        <div class="no-selection">
                            Выберите улучшение для просмотра деталей
                        </div>
                    </div>
                </div>
                <div class="upgrade-footer">
                    <button class="reset-btn" id="resetUpgrades">Сбросить все</button>
                    <button class="save-btn" id="saveProgress">Сохранить прогресс</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.container);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Закрытие панели
        document.getElementById('closeUpgrades').addEventListener('click', () => {
            this.hide();
        });

        // Сброс улучшений
        document.getElementById('resetUpgrades').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбросить все улучшения?')) {
                this.upgradeSystem.resetUpgrades();
                this.updateUI(0);
            }
        });

        // Сохранение прогресса
        document.getElementById('saveProgress').addEventListener('click', () => {
            this.upgradeSystem.saveProgress();
            this.showMessage('Прогресс сохранен!');
        });

        // Закрытие по клику вне панели
        this.container.addEventListener('click', (event) => {
            if (event.target === this.container) {
                this.hide();
            }
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * Показать панель улучшений
     * @param {number} playerScore - Текущий счет игрока
     */
    show(playerScore) {
        this.isVisible = true;
        this.container.style.display = 'flex';
        this.updateUI(playerScore);
        
        // Фокус на панели для клавиатурного управления
        this.container.focus();
    }

    /**
     * Скрыть панель улучшений
     */
    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
        this.selectedUpgrade = null;
        
        // Уведомляем о закрытии панели
        window.dispatchEvent(new CustomEvent('upgradeUIClosed'));
    }

    /**
     * Обновление интерфейса
     * @param {number} playerScore - Текущий счет игрока
     */
    updateUI(playerScore) {
        // Обновление счета
        document.getElementById('upgradeScore').textContent = playerScore;

        // Обновление списка улучшений
        this.updateUpgradeList(playerScore);

        // Обновление деталей выбранного улучшения
        if (this.selectedUpgrade) {
            this.updateUpgradeDetails(this.selectedUpgrade, playerScore);
        }
    }

    /**
     * Обновление списка улучшений
     * @param {number} playerScore - Текущий счет игрока
     */
    updateUpgradeList(playerScore) {
        const upgradeList = document.getElementById('upgradeList');
        const upgrades = this.upgradeSystem.getAllUpgrades();

        upgradeList.innerHTML = '';

        upgrades.forEach(upgrade => {
            const upgradeItem = document.createElement('div');
            upgradeItem.className = 'upgrade-item';
            upgradeItem.dataset.upgradeId = upgrade.id;

            const canAfford = playerScore >= upgrade.cost;
            const isMaxLevel = upgrade.currentLevel >= upgrade.maxLevel;

            upgradeItem.innerHTML = `
                <div class="upgrade-icon">
                    ${this.getUpgradeIcon(upgrade.id)}
                </div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-level">Уровень: ${upgrade.currentLevel}/${upgrade.maxLevel}</div>
                    <div class="upgrade-cost ${canAfford ? 'affordable' : 'expensive'}">
                        ${isMaxLevel ? 'МАКС' : `Стоимость: ${upgrade.cost}`}
                    </div>
                </div>
                <div class="upgrade-actions">
                    <button class="upgrade-btn ${canAfford && !isMaxLevel ? 'available' : 'disabled'}" 
                            ${canAfford && !isMaxLevel ? '' : 'disabled'}>
                        ${isMaxLevel ? 'МАКС' : 'Купить'}
                    </button>
                </div>
            `;

            // Обработчик клика на улучшение
            upgradeItem.addEventListener('click', () => {
                this.selectUpgrade(upgrade.id, playerScore);
            });

            // Обработчик покупки
            const buyButton = upgradeItem.querySelector('.upgrade-btn');
            buyButton.addEventListener('click', (event) => {
                event.stopPropagation();
                this.purchaseUpgrade(upgrade.id, playerScore);
            });

            upgradeList.appendChild(upgradeItem);
        });
    }

    /**
     * Получение иконки для улучшения
     * @param {string} upgradeId - ID улучшения
     * @returns {string} HTML иконки
     */
    getUpgradeIcon(upgradeId) {
        const icons = {
            fireRate: '🔥',
            damage: '💥',
            speed: '⚡',
            planetHealth: '🛡️',
            multiShot: '🎯'
        };
        return icons[upgradeId] || '⭐';
    }

    /**
     * Выбор улучшения для просмотра деталей
     * @param {string} upgradeId - ID улучшения
     * @param {number} playerScore - Текущий счет игрока
     */
    selectUpgrade(upgradeId, playerScore) {
        // Удаление предыдущего выделения
        document.querySelectorAll('.upgrade-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Выделение нового элемента
        const selectedItem = document.querySelector(`[data-upgrade-id="${upgradeId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }

        this.selectedUpgrade = upgradeId;
        this.updateUpgradeDetails(upgradeId, playerScore);
    }

    /**
     * Обновление деталей улучшения
     * @param {string} upgradeId - ID улучшения
     * @param {number} playerScore - Текущий счет игрока
     */
    updateUpgradeDetails(upgradeId, playerScore) {
        const upgradeDetails = document.getElementById('upgradeDetails');
        const upgrade = this.upgradeSystem.getUpgradeInfo(upgradeId);

        if (!upgrade) {
            upgradeDetails.innerHTML = '<div class="no-selection">Улучшение не найдено</div>';
            return;
        }

        const currentEffect = this.formatEffect(upgradeId, upgrade.currentEffect);
        const nextEffect = upgrade.nextEffect ? this.formatEffect(upgradeId, upgrade.nextEffect) : null;

        upgradeDetails.innerHTML = `
            <div class="upgrade-detail-content">
                <h3>${upgrade.name}</h3>
                <p class="upgrade-description">${upgrade.description}</p>
                
                <div class="upgrade-stats">
                    <div class="stat-row">
                        <span class="stat-label">Текущий уровень:</span>
                        <span class="stat-value">${upgrade.currentLevel}/${upgrade.maxLevel}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Текущий эффект:</span>
                        <span class="stat-value">${currentEffect}</span>
                    </div>
                    ${nextEffect ? `
                        <div class="stat-row">
                            <span class="stat-label">Следующий уровень:</span>
                            <span class="stat-value">${nextEffect}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Стоимость:</span>
                            <span class="stat-value ${playerScore >= upgrade.cost ? 'affordable' : 'expensive'}">
                                ${upgrade.cost} очков
                            </span>
                        </div>
                    ` : `
                        <div class="stat-row">
                            <span class="stat-label">Статус:</span>
                            <span class="stat-value max-level">Максимальный уровень</span>
                        </div>
                    `}
                </div>

                ${upgrade.canUpgrade && playerScore >= upgrade.cost ? `
                    <button class="purchase-btn" onclick="upgradeUI.purchaseUpgrade('${upgradeId}', ${playerScore})">
                        Купить за ${upgrade.cost} очков
                    </button>
                ` : ''}
            </div>
        `;
    }

    /**
     * Форматирование эффекта улучшения для отображения
     * @param {string} upgradeId - ID улучшения
     * @param {number} effect - Значение эффекта
     * @returns {string} Отформатированная строка
     */
    formatEffect(upgradeId, effect) {
        switch (upgradeId) {
            case 'fireRate':
                return `×${effect.toFixed(1)} скорость стрельбы`;
            case 'damage':
                return `×${effect.toFixed(1)} урон`;
            case 'speed':
                return `×${effect.toFixed(1)} скорость движения`;
            case 'planetHealth':
                return `+${effect} здоровья планеты`;
            case 'multiShot':
                return `${effect} снаряд(ов) за выстрел`;
            default:
                return effect.toString();
        }
    }

    /**
     * Покупка улучшения
     * @param {string} upgradeId - ID улучшения
     * @param {number} playerScore - Текущий счет игрока
     */
    purchaseUpgrade(upgradeId, playerScore) {
        const result = this.upgradeSystem.purchaseUpgrade(upgradeId, playerScore);
        
        if (result.success) {
            this.showMessage(result.message, 'success');
            // Уведомляем игровой движок о покупке
            window.dispatchEvent(new CustomEvent('upgradePurchased', {
                detail: { upgradeId, cost: result.cost, newLevel: result.newLevel }
            }));
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    /**
     * Показ сообщения
     * @param {string} message - Текст сообщения
     * @param {string} type - Тип сообщения (success, error, info)
     */
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `upgrade-message ${type}`;
        messageDiv.textContent = message;
        
        this.container.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    /**
     * Проверка видимости панели
     * @returns {boolean} True если панель видима
     */
    isOpen() {
        return this.isVisible;
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UpgradeUI;
}