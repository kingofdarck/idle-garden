/**
 * Plant Configuration Data
 * Defines all available plant types with their costs, income rates, and growth times
 */

/**
 * Plant configuration object containing all plant types
 * Each plant has: growthTime (ms), income (coins per cycle), cost (resources needed)
 */
const PLANT_CONFIGS = {
    // Уровень 0 - Стартовое (всегда разблокировано)
    'carrot': {
        name: 'Морковь',
        icon: '🥕',
        growthTime: 20000,
        income: 10,
        cost: {
            coins: 15,
            seeds: 2,
            water: 2
        },
        description: 'Быстрорастущая стартовая культура',
        tier: 0,
        unlockRequirement: null
    },
    
    // Уровень 1 - Базовые растения
    'lettuce': {
        name: 'Салат',
        icon: '🥬',
        growthTime: 25000,
        income: 15,
        cost: {
            coins: 50,
            seeds: 6,
            water: 6
        },
        description: 'Быстрый урожай, стабильный доход',
        tier: 1,
        unlockRequirement: null
    },
    
    'radish': {
        name: 'Редис',
        icon: '🌱',
        growthTime: 12000,
        income: 20,
        cost: {
            coins: 80,
            seeds: 8,
            water: 8
        },
        description: 'Хрустящий и прибыльный',
        tier: 1,
        unlockRequirement: null
    },
    
    // Уровень 2 - Средний уровень
    'tomato': {
        name: 'Помидор',
        icon: '🍅',
        growthTime: 10000,
        income: 30,
        cost: {
            coins: 150,
            seeds: 12,
            water: 12
        },
        description: 'Популярная культура с хорошей отдачей',
        tier: 2,
        unlockRequirement: null
    },
    
    'cucumber': {
        name: 'Огурец',
        icon: '🥒',
        growthTime: 11000,
        income: 35,
        cost: {
            coins: 250,
            seeds: 15,
            water: 15
        },
        description: 'Прохладная и освежающая прибыль',
        tier: 2,
        unlockRequirement: null
    },
    
    'pepper': {
        name: 'Перец',
        icon: '🌶️',
        growthTime: 12000,
        income: 40,
        cost: {
            coins: 400,
            seeds: 20,
            water: 20
        },
        description: 'Острая прибыль с умеренным ростом',
        tier: 2,
        unlockRequirement: null
    },
    
    'broccoli': {
        name: 'Брокколи',
        icon: '🥦',
        growthTime: 13000,
        income: 45,
        cost: {
            coins: 600,
            seeds: 25,
            water: 25
        },
        description: 'Здоровый и богатый',
        tier: 2,
        unlockRequirement: null
    },
    
    // Уровень 3 - Продвинутые растения
    'eggplant': {
        name: 'Баклажан',
        icon: '🍆',
        growthTime: 15000,
        income: 60,
        cost: {
            coins: 1000,
            seeds: 30,
            water: 30
        },
        description: 'Медленный рост, высокий урожай',
        tier: 3,
        unlockRequirement: null
    },
    
    'potato': {
        name: 'Картофель',
        icon: '🥔',
        growthTime: 16000,
        income: 70,
        cost: {
            coins: 1500,
            seeds: 35,
            water: 35
        },
        description: 'Подземное сокровище',
        tier: 3,
        unlockRequirement: null
    },
    
    'corn': {
        name: 'Кукуруза',
        icon: '🌽',
        growthTime: 18000,
        income: 90,
        cost: {
            coins: 2500,
            seeds: 40,
            water: 40
        },
        description: 'Премиальная культура с отличной отдачей',
        tier: 3,
        unlockRequirement: null
    },
    
    'onion': {
        name: 'Лук',
        icon: '🧅',
        growthTime: 20000,
        income: 110,
        cost: {
            coins: 4000,
            seeds: 45,
            water: 45
        },
        description: 'Слои прибыли',
        tier: 3,
        unlockRequirement: null
    },
    
    // Уровень 4 - Премиальные растения
    'pumpkin': {
        name: 'Тыква',
        icon: '🎃',
        growthTime: 25000,
        income: 150,
        cost: {
            coins: 6000,
            seeds: 50,
            water: 50
        },
        description: 'Сезонный фаворит, высокая ценность',
        tier: 4,
        unlockRequirement: null
    },
    
    'watermelon': {
        name: 'Арбуз',
        icon: '🍉',
        growthTime: 30000,
        income: 200,
        cost: {
            coins: 10000,
            seeds: 60,
            water: 60
        },
        description: 'Большой фрукт, большая прибыль',
        tier: 4,
        unlockRequirement: null
    },
    
    'cauliflower': {
        name: 'Цветная капуста',
        icon: '🥬',
        growthTime: 32000,
        income: 220,
        cost: {
            coins: 15000,
            seeds: 70,
            water: 70
        },
        description: 'Белое золото сада',
        tier: 4,
        unlockRequirement: null
    },
    
    // Уровень 5 - Роскошные растения
    'strawberry': {
        name: 'Клубника',
        icon: '🍓',
        growthTime: 35000,
        income: 280,
        cost: {
            coins: 8000,
            seeds: 80,
            water: 80
        },
        description: 'Сладкая отдача для терпеливых садоводов',
        tier: 5,
        unlockRequirement: null
    },
    
    'banana': {
        name: 'Банан',
        icon: '🍌',
        growthTime: 38000,
        income: 320,
        cost: {
            coins: 12000,
            seeds: 90,
            water: 90
        },
        description: 'Тропическое наслаждение',
        tier: 5,
        unlockRequirement: null
    },
    
    'grape': {
        name: 'Виноград',
        icon: '🍇',
        growthTime: 40000,
        income: 380,
        cost: {
            coins: 18000,
            seeds: 100,
            water: 100
        },
        description: 'Роскошная культура для продвинутых садоводов',
        tier: 5,
        unlockRequirement: null
    },
    
    'apple': {
        name: 'Яблоко',
        icon: '🍎',
        growthTime: 42000,
        income: 420,
        cost: {
            coins: 25000,
            seeds: 120,
            water: 120
        },
        description: 'Яблоко в день отгоняет бедность',
        tier: 5,
        unlockRequirement: null
    },
    
    // Уровень 6 - Кристальные растения (требуют кристаллы)
    'blueberry': {
        name: 'Черника',
        icon: '🫐',
        growthTime: 45000,
        income: 500,
        cost: {
            coins: 35000,
            seeds: 140,
            water: 140,
            gems: 1
        },
        description: 'Редкая ягода с премиальной ценностью',
        tier: 6,
        unlockRequirement: null
    },
    
    'cherry': {
        name: 'Вишня',
        icon: '🍒',
        growthTime: 50000,
        income: 650,
        cost: {
            coins: 50000,
            seeds: 160,
            water: 160,
            gems: 2
        },
        description: 'Сладкая прибыль для инвесторов в кристаллы',
        tier: 6,
        unlockRequirement: null
    },
    
    'orange': {
        name: 'Апельсин',
        icon: '🍊',
        growthTime: 55000,
        income: 750,
        cost: {
            coins: 75000,
            seeds: 180,
            water: 180,
            gems: 3
        },
        description: 'Цитрусовая сенсация',
        tier: 6,
        unlockRequirement: null
    },
    
    'peach': {
        name: 'Персик',
        icon: '🍑',
        growthTime: 60000,
        income: 900,
        cost: {
            coins: 120000,
            seeds: 200,
            water: 200,
            gems: 5
        },
        description: 'Сочная отдача с терпением',
        tier: 6,
        unlockRequirement: null
    },
    
    // Уровень 7 - Элитные растения (требуют удобрение)
    'pineapple': {
        name: 'Ананас',
        icon: '🍍',
        growthTime: 70000,
        income: 1200,
        cost: {
            coins: 200000,
            seeds: 250,
            water: 250,
            gems: 8,
            fertilizer: 2
        },
        description: 'Тропическое сокровище для элитных садоводов',
        tier: 7,
        unlockRequirement: null
    },
    
    'mango': {
        name: 'Манго',
        icon: '🥭',
        growthTime: 80000,
        income: 1600,
        cost: {
            coins: 350000,
            seeds: 300,
            water: 300,
            gems: 12,
            fertilizer: 3
        },
        description: 'Экзотический фрукт с массивной отдачей',
        tier: 7,
        unlockRequirement: null
    },
    
    'lemon': {
        name: 'Лимон',
        icon: '🍋',
        growthTime: 85000,
        income: 1800,
        cost: {
            coins: 500000,
            seeds: 350,
            water: 350,
            gems: 18,
            fertilizer: 4
        },
        description: 'Кислая цена, сладкая прибыль',
        tier: 7,
        unlockRequirement: null
    },
    
    'coconut': {
        name: 'Кокос',
        icon: '🥥',
        growthTime: 90000,
        income: 2200,
        cost: {
            coins: 750000,
            seeds: 400,
            water: 400,
            gems: 25,
            fertilizer: 5
        },
        description: 'Прибыль райского острова',
        tier: 7,
        unlockRequirement: null
    },
    
    // Уровень 8 - Легендарные растения
    'dragonfruit': {
        name: 'Драконий фрукт',
        icon: '🐉',
        growthTime: 100000,
        income: 3000,
        cost: {
            coins: 1200000,
            seeds: 500,
            water: 500,
            gems: 35,
            fertilizer: 8
        },
        description: 'Мифический фрукт легенд',
        tier: 8,
        unlockRequirement: null
    },
    
    'goldenfruit': {
        name: 'Золотой фрукт',
        icon: '🌟',
        growthTime: 120000,
        income: 4500,
        cost: {
            coins: 2000000,
            seeds: 600,
            water: 600,
            gems: 50,
            fertilizer: 12
        },
        description: 'Окончательный урожай для мастеров-садоводов',
        tier: 8,
        unlockRequirement: null
    },
    
    'crystalrose': {
        name: 'Кристальная роза',
        icon: '🌹',
        growthTime: 150000,
        income: 7000,
        cost: {
            coins: 3500000,
            seeds: 750,
            water: 750,
            gems: 75,
            fertilizer: 18
        },
        description: 'Легендарный цветок стоимостью целое состояние',
        tier: 8,
        unlockRequirement: null
    },
    
    'starfruit': {
        name: 'Звездный фрукт',
        icon: '⭐',
        growthTime: 180000,
        income: 10000,
        cost: {
            coins: 5000000,
            seeds: 900,
            water: 900,
            gems: 100,
            fertilizer: 25
        },
        description: 'Небесный урожай космической ценности',
        tier: 8,
        unlockRequirement: null
    },
    
    // Уровень 9 - Космические растения
    'moonflower': {
        name: 'Лунный цветок',
        icon: '🌙',
        growthTime: 210000,
        income: 15000,
        cost: {
            coins: 8000000,
            seeds: 1200,
            water: 1200,
            gems: 150,
            fertilizer: 35
        },
        description: 'Цветет под лунным светом с астрономической ценностью',
        tier: 9,
        unlockRequirement: null
    },
    
    'sunflower': {
        name: 'Солнечный цветок',
        icon: '🌻',
        growthTime: 240000,
        income: 20000,
        cost: {
            coins: 15000000,
            seeds: 1500,
            water: 1500,
            gems: 250,
            fertilizer: 50
        },
        description: 'Излучает чистую золотую прибыль',
        tier: 9,
        unlockRequirement: null
    },
    
    'cosmicorchid': {
        name: 'Космическая орхидея',
        icon: '🪐',
        growthTime: 300000,
        income: 30000,
        cost: {
            coins: 25000000,
            seeds: 2000,
            water: 2000,
            gems: 400,
            fertilizer: 75
        },
        description: 'Редчайший цветок во вселенной',
        tier: 9,
        unlockRequirement: null
    }
};

/**
 * Get plant configuration by type
 * @param {string} plantType - The plant type identifier
 * @returns {Object|null} Plant configuration or null if not found
 */
function getPlantConfig(plantType) {
    return PLANT_CONFIGS[plantType] || null;
}

/**
 * Get all available plant types
 * @returns {string[]} Array of plant type identifiers
 */
function getAllPlantTypes() {
    return Object.keys(PLANT_CONFIGS);
}

/**
 * Validate if a plant type exists
 * @param {string} plantType - The plant type to validate
 * @returns {boolean} True if plant type exists
 */
function isValidPlantType(plantType) {
    return plantType in PLANT_CONFIGS;
}

/**
 * Get plants sorted by cost (cheapest first)
 * @returns {Array} Array of plant configurations sorted by total cost
 */
function getPlantsSortedByCost() {
    return Object.entries(PLANT_CONFIGS)
        .map(([type, config]) => ({ type, ...config }))
        .sort((a, b) => {
            const costA = a.cost.coins + a.cost.seeds + a.cost.water;
            const costB = b.cost.coins + b.cost.seeds + b.cost.water;
            return costA - costB;
        });
}

/**
 * Get plants sorted by income efficiency (income per second)
 * @returns {Array} Array of plant configurations sorted by efficiency
 */
function getPlantsSortedByEfficiency() {
    return Object.entries(PLANT_CONFIGS)
        .map(([type, config]) => ({
            type,
            ...config,
            efficiency: (config.income / (config.growthTime / 1000))
        }))
        .sort((a, b) => b.efficiency - a.efficiency);
}

/**
 * Get the cheapest plant configuration
 * @returns {Object} Cheapest plant configuration with type
 */
function getCheapestPlant() {
    const sortedPlants = getPlantsSortedByCost();
    return sortedPlants.length > 0 ? sortedPlants[0] : null;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PLANT_CONFIGS,
        getPlantConfig,
        getAllPlantTypes,
        isValidPlantType,
        getPlantsSortedByCost,
        getPlantsSortedByEfficiency,
        getCheapestPlant
    };
} else if (typeof window !== 'undefined') {
    window.PLANT_CONFIGS = PLANT_CONFIGS;
    window.getPlantConfig = getPlantConfig;
    window.getAllPlantTypes = getAllPlantTypes;
    window.isValidPlantType = isValidPlantType;
    window.getPlantsSortedByCost = getPlantsSortedByCost;
    window.getPlantsSortedByEfficiency = getPlantsSortedByEfficiency;
    window.getCheapestPlant = getCheapestPlant;
}