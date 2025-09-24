document.addEventListener('DOMContentLoaded', () => {
    // --- I18n Strings ---
    const strings = {
        th: {
            hunger: 'หิว',
            happiness: 'ความสุข',
            energy: 'พลังงาน',
            feed: 'ให้อาหาร',
            clean: 'ทำความสะอาด',
            play: 'เล่นด้วย',
            train: 'ฝึกฝน',
            levelUp: 'เลเวลอัป! เป็นเลเวล {level} แล้ว!',
            expGain: 'ได้รับการฝึกฝน! ได้รับ {exp} EXP!',
            noEnergyTrain: 'พลังงานไม่พอสำหรับฝึกฝน',
            noEnergyEat: 'มันเหนื่อยเกินไปที่จะกิน',
            noEnergyPlay: 'มันเหนื่อยเกินไปที่จะเล่น',
            cleaned: 'สะอาดแล้ว!',
            alreadyClean: 'ไม่เห็นมีอะไรให้ทำความสะอาดเลย',
            gameOverHunger: 'เจ้ามอนหิวจนหมดแรง...',
            gameOverSad: 'เจ้ามอนเศร้าจนหนีออกจากบ้าน...',
            loadSuccess: 'โหลดข้อมูลล่าสุดจ้า!',
            welcome: 'สวัสดี! ฉันคือดิจิมอนคู่หูของนาย!',
        },
        en: {
            hunger: 'Hunger',
            happiness: 'Happiness',
            energy: 'Energy',
            feed: 'Feed',
            clean: 'Clean',
            play: 'Play',
            train: 'Train',
            levelUp: 'Leveled up! Now level {level}!',
            expGain: 'Training complete! Gained {exp} EXP!',
            noEnergyTrain: 'Not enough energy to train',
            noEnergyEat: 'Too tired to eat',
            noEnergyPlay: 'Too tired to play',
            cleaned: 'All clean!',
            alreadyClean: 'There is nothing to clean',
            gameOverHunger: 'The monster fainted from hunger...',
            gameOverSad: 'The monster ran away from sadness...',
            loadSuccess: 'Successfully loaded save data!',
            welcome: 'Hello! I am your partner Digimon!',
        }
    };
    let currentLang = 'th';

    // --- DOM Elements ---
    const gameContainer = document.getElementById('game-container');
    const monsterImage = document.getElementById('monster-image');
    const notificationArea = document.getElementById('notification-area');
    const poopArea = document.getElementById('poop-area');
    const allButtons = ['feed', 'clean', 'play', 'train'].map(id => document.getElementById(`${id}-button`));

    // Stat Displays
    const hungerStat = document.getElementById('hunger-stat');
    const happinessStat = document.getElementById('happiness-stat');
    const energyStat = document.getElementById('energy-stat');
    const levelStat = document.getElementById('level-stat');
    const expStat = document.getElementById('exp-stat');
    const expNextStat = document.getElementById('exp-next-stat');
    const atkStat = document.getElementById('atk-stat');
    const defStat = document.getElementById('def-stat');
    const spdStat = document.getElementById('spd-stat');

    // --- Game State ---
    let monster = {};
    let isAnimating = false;
    const SAVE_KEY = 'pocketmonster-save';

    // --- Core Functions ---
    function getString(key, replacements = {}) {
        let str = strings[currentLang][key] || key;
        for (const placeholder in replacements) {
            str = str.replace(`{${placeholder}}`, replacements[placeholder]);
        }
        return str;
    }

    function updateUIText() {
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            el.textContent = getString(key);
        });
    }

    function playAnimation(animationName, duration) {
        if (isAnimating) return;
        isAnimating = true;
        allButtons.forEach(b => b.disabled = true);

        const idleGif = `Monster/${monster.name}/idle.gif`;
        const actionGif = `Monster/${monster.name}/${animationName}.gif`;

        monsterImage.src = actionGif;

        setTimeout(() => {
            monsterImage.src = idleGif;
            allButtons.forEach(b => b.disabled = false);
            isAnimating = false;
        }, duration);
    }

    function initMonsterState() {
        monster = {
            name: 'Agumon',
            hunger: 100,
            happiness: 100,
            energy: 100,
            poopCount: 0,
            level: 1,
            exp: 0,
            expToNextLevel: 100,
            atk: 5,
            def: 5,
            spd: 5,
        };
    }

    function saveGame() {
        localStorage.setItem(SAVE_KEY, JSON.stringify(monster));
    }

    function loadGame() {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            monster = JSON.parse(savedData);
            // Backward compatibility
            monster.name = monster.name || 'Agumon';
            showNotification(getString('loadSuccess'));
        } else {
            initMonsterState();
            showNotification(getString('welcome'));
        }
        monsterImage.src = `Monster/${monster.name}/idle.gif`;
        updateUIText();
        updateStats();
    }

    function updateStats() {
        hungerStat.textContent = monster.hunger;
        happinessStat.textContent = monster.happiness;
        energyStat.textContent = monster.energy;
        levelStat.textContent = monster.level;
        expStat.textContent = monster.exp;
        expNextStat.textContent = monster.expToNextLevel;
        atkStat.textContent = monster.atk;
        defStat.textContent = monster.def;
        spdStat.textContent = monster.spd;

        poopArea.innerHTML = ''.padStart(monster.poopCount, '💩');

        if (monster.hunger <= 0 || monster.happiness <= 0) {
            const reason = monster.hunger <= 0 ? getString('gameOverHunger') : getString('gameOverSad');
            endGame(reason);
        }
    }

    function showNotification(message) {
        notificationArea.textContent = message;
        setTimeout(() => { notificationArea.textContent = ''; }, 2000);
    }

    function levelUp() {
        monster.level++;
        monster.exp = 0;
        monster.expToNextLevel = Math.floor(monster.expToNextLevel * 1.5);
        monster.atk += Math.floor(Math.random() * 3) + 1;
        monster.def += Math.floor(Math.random() * 3) + 1;
        monster.spd += Math.floor(Math.random() * 3) + 1;
        showNotification(getString('levelUp', { level: monster.level }));
    }

    function addExperience(amount) {
        monster.exp += amount;
        if (monster.exp >= monster.expToNextLevel) {
            levelUp();
        }
    }

    // --- Actions ---
    function train() {
        if (isAnimating) return;
        if (monster.energy < 20) { return showNotification(getString('noEnergyTrain')); }
        monster.energy -= 20;
        const expGained = Math.floor(Math.random() * 20) + 10; // Gain 10-29 exp
        addExperience(expGained);
        showNotification(getString('expGain', { exp: expGained }));
        playAnimation('train', 2000);
        updateStats();
    }

    function feed() {
        if (isAnimating) return;
        if (monster.energy <= 0) { return showNotification(getString('noEnergyEat')); }
        monster.hunger = Math.min(100, monster.hunger + 20);
        monster.energy = Math.max(0, monster.energy - 5);
        if (Math.random() < 0.3) { monster.poopCount = Math.min(3, monster.poopCount + 1); }
        playAnimation('eat', 2000);
        updateStats();
    }

    function clean() {
        if (isAnimating) return;
        if (monster.poopCount > 0) {
            monster.poopCount = 0;
            monster.happiness = Math.min(100, monster.happiness + 10);
            showNotification(getString('cleaned'));
        } else {
            showNotification(getString('alreadyClean'));
        }
        updateStats();
    }

    function play() {
        if (isAnimating) return;
        if (monster.energy <= 10) { return showNotification(getString('noEnergyPlay')); }
        monster.happiness = Math.min(100, monster.happiness + 15);
        monster.energy = Math.max(0, monster.energy - 10);
        playAnimation('play', 2000);
        updateStats();
    }

    function endGame(reason) {
        clearInterval(gameLoop);
        monsterImage.style.filter = 'grayscale(100%)';
        showNotification(reason);
        allButtons.forEach(b => b.disabled = true);
        localStorage.removeItem(SAVE_KEY);
    }

    // --- Event Listeners ---
    document.getElementById('feed-button').addEventListener('click', feed);
    document.getElementById('clean-button').addEventListener('click', clean);
    document.getElementById('play-button').addEventListener('click', play);
    document.getElementById('train-button').addEventListener('click', train);

    // --- Game Loop ---
    const gameLoop = setInterval(() => {
        if (isAnimating) return; // Pause stat decay during animations
        monster.hunger = Math.max(0, monster.hunger - 2);
        monster.happiness = Math.max(0, monster.happiness - 1);
        if (monster.poopCount > 0) { monster.happiness = Math.max(0, monster.happiness - 3); }
        updateStats();
        saveGame();
    }, 3000);

    // --- Initial Setup ---
    loadGame();
});
