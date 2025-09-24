document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const monsterImage = document.getElementById('monster-image');
    const notificationArea = document.getElementById('notification-area');
    const poopArea = document.getElementById('poop-area');

    // Buttons
    const feedButton = document.getElementById('feed-button');
    const cleanButton = document.getElementById('clean-button');
    const playButton = document.getElementById('play-button');
    const trainButton = document.getElementById('train-button');

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
    const SAVE_KEY = 'pocketmonster-save';

    function initMonsterState() {
        monster = {
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

    // --- Save/Load Functions (Using localStorage) ---
    function saveGame() {
        localStorage.setItem(SAVE_KEY, JSON.stringify(monster));
    }

    function loadGame() {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            monster = JSON.parse(savedData);
            // Backward compatibility for old saves
            monster.level = monster.level || 1;
            monster.exp = monster.exp || 0;
            monster.expToNextLevel = monster.expToNextLevel || 100;
            monster.atk = monster.atk || 5;
            monster.def = monster.def || 5;
            monster.spd = monster.spd || 5;
            showNotification("โหลดข้อมูลล่าสุดจ้า!");
        } else {
            initMonsterState();
            showNotification("สวัสดี! ฉันคือดิจิมอนคู่หูของนาย!");
        }
        updateStats();
    }

    // --- Game Logic ---
    function updateStats() {
        // Core Stats
        hungerStat.textContent = monster.hunger;
        happinessStat.textContent = monster.happiness;
        energyStat.textContent = monster.energy;
        // Growth Stats
        levelStat.textContent = monster.level;
        expStat.textContent = monster.exp;
        expNextStat.textContent = monster.expToNextLevel;
        atkStat.textContent = monster.atk;
        defStat.textContent = monster.def;
        spdStat.textContent = monster.spd;

        poopArea.innerHTML = '';
        for (let i = 0; i < monster.poopCount; i++) {
            poopArea.innerHTML += '💩';
        }

        if (monster.hunger <= 0 || monster.happiness <= 0) {
            endGame(monster.hunger <= 0 ? "เจ้ามอนหิวจนหมดแรง..." : "เจ้ามอนเศร้าจนหนีออกจากบ้าน...");
        }
    }

    function showNotification(message) {
        notificationArea.textContent = message;
        setTimeout(() => {
            notificationArea.textContent = '';
        }, 2000);
    }

    function levelUp() {
        monster.level++;
        monster.exp = 0;
        monster.expToNextLevel = Math.floor(monster.expToNextLevel * 1.5);
        monster.atk += Math.floor(Math.random() * 3) + 1; // Increase by 1-3
        monster.def += Math.floor(Math.random() * 3) + 1;
        monster.spd += Math.floor(Math.random() * 3) + 1;
        showNotification(`เลเวลอัป! เป็นเลเวล ${monster.level} แล้ว!`);
    }

    function addExperience(amount) {
        monster.exp += amount;
        if (monster.exp >= monster.expToNextLevel) {
            levelUp();
        }
    }

    function train() {
        if (monster.energy < 20) {
            showNotification("พลังงานไม่พอสำหรับฝึกฝน");
            return;
        }
        monster.energy -= 20;
        const expGained = Math.floor(Math.random() * 20) + 10; // Gain 10-29 exp
        addExperience(expGained);
        showNotification(`ได้รับการฝึกฝน! ได้รับ ${expGained} EXP!`);
        updateStats();
    }

    function feed() {
        if (monster.energy <= 0) { return; }
        monster.hunger = Math.min(100, monster.hunger + 20);
        monster.energy = Math.max(0, monster.energy - 5);
        if (Math.random() < 0.3) { monster.poopCount = Math.min(3, monster.poopCount + 1); }
        updateStats();
    }

    function clean() {
        if (monster.poopCount > 0) {
            monster.poopCount = 0;
            monster.happiness = Math.min(100, monster.happiness + 10);
        }
        updateStats();
    }

    function play() {
        if (monster.energy <= 10) { return; }
        monster.happiness = Math.min(100, monster.happiness + 15);
        monster.energy = Math.max(0, monster.energy - 10);
        updateStats();
    }

    function endGame(reason) {
        clearInterval(gameLoop);
        monsterImage.style.filter = 'grayscale(100%)';
        showNotification(reason);
        [feedButton, cleanButton, playButton, trainButton].forEach(b => b.disabled = true);
        localStorage.removeItem(SAVE_KEY);
    }

    // --- Event Listeners ---
    feedButton.addEventListener('click', feed);
    cleanButton.addEventListener('click', clean);
    playButton.addEventListener('click', play);
    trainButton.addEventListener('click', train);

    // --- Game Loop ---
    const gameLoop = setInterval(() => {
        monster.hunger = Math.max(0, monster.hunger - 2);
        monster.happiness = Math.max(0, monster.happiness - 1);
        if (monster.poopCount > 0) { monster.happiness = Math.max(0, monster.happiness - 3); }
        updateStats();
        saveGame();
    }, 3000);

    // --- Initial Setup ---
    loadGame();
});