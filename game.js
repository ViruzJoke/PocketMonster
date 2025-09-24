document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const monsterImage = document.getElementById('monster-image');
    const hungerStat = document.getElementById('hunger-stat');
    const happinessStat = document.getElementById('happiness-stat');
    const energyStat = document.getElementById('energy-stat');
    const feedButton = document.getElementById('feed-button');
    const cleanButton = document.getElementById('clean-button');
    const playButton = document.getElementById('play-button');
    const saveButton = document.getElementById('save-button'); // New
    const notificationArea = document.getElementById('notification-area');
    const poopArea = document.getElementById('poop-area');

    // --- Game State ---
    let monster = {
        hunger: 100,
        happiness: 100,
        energy: 100,
        poopCount: 0,
    };

    // --- Game Functions ---
    function updateStats() {
        hungerStat.textContent = monster.hunger;
        happinessStat.textContent = monster.happiness;
        energyStat.textContent = monster.energy;

        poopArea.innerHTML = '';
        for (let i = 0; i < monster.poopCount; i++) {
            poopArea.innerHTML += '💩';
        }

        if (monster.hunger <= 0) {
            endGame("เจ้ามอนหิวจนหมดแรง...");
        }
    }

    function showNotification(message) {
        notificationArea.textContent = message;
        setTimeout(() => {
            notificationArea.textContent = '';
        }, 2000);
    }

    function feed() {
        if (monster.energy <= 0) {
            showNotification("มันเหนื่อยเกินไปที่จะกิน");
            return;
        }
        monster.hunger = Math.min(100, monster.hunger + 20);
        monster.energy = Math.max(0, monster.energy - 5);
        if (Math.random() < 0.3) {
            monster.poopCount = Math.min(3, monster.poopCount + 1);
        }
        updateStats();
    }

    function clean() {
        if (monster.poopCount > 0) {
            monster.poopCount = 0;
            monster.happiness = Math.min(100, monster.happiness + 10);
            showNotification("สะอาดแล้ว!");
        } else {
            showNotification("ไม่เห็นมีอะไรให้ทำความสะอาดเลย");
        }
        updateStats();
    }

    function play() {
        if (monster.energy <= 10) {
            showNotification("มันเหนื่อยเกินไปที่จะเล่น");
            return;
        }
        monster.happiness = Math.min(100, monster.happiness + 15);
        monster.energy = Math.max(0, monster.energy - 10);
        updateStats();
    }

    function endGame(reason) {
        clearInterval(gameLoop);
        monsterImage.style.filter = 'grayscale(100%)';
        showNotification(reason);
        feedButton.disabled = true;
        cleanButton.disabled = true;
        playButton.disabled = true;
        saveButton.disabled = true;
    }

    // --- Save/Load Functions ---
    async function saveGame() {
        try {
            document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const monsterImage = document.getElementById('monster-image');
    const hungerStat = document.getElementById('hunger-stat');
    const happinessStat = document.getElementById('happiness-stat');
    const energyStat = document.getElementById('energy-stat');
    const feedButton = document.getElementById('feed-button');
    const cleanButton = document.getElementById('clean-button');
    const playButton = document.getElementById('play-button');
    const notificationArea = document.getElementById('notification-area');
    const poopArea = document.getElementById('poop-area');

    // --- Game State ---
    let monster = {
        hunger: 100,
        happiness: 100,
        energy: 100,
        poopCount: 0,
    };

    const SAVE_KEY = 'pocketmonster-save';

    // --- Save/Load Functions (Using localStorage) ---
    function saveGame() {
        localStorage.setItem(SAVE_KEY, JSON.stringify(monster));
    }

    function loadGame() {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            monster = JSON.parse(savedData);
            showNotification("โหลดข้อมูลล่าสุดจ้า!");
        } else {
            showNotification("สวัสดี! ฉันคือดิจิมอนคู่หูของนาย!");
        }
        updateStats();
    }

    // --- Game Functions ---
    function updateStats() {
        hungerStat.textContent = monster.hunger;
        happinessStat.textContent = monster.happiness;
        energyStat.textContent = monster.energy;

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

    function feed() {
        if (monster.energy <= 0) {
            showNotification("มันเหนื่อยเกินไปที่จะกิน");
            return;
        }
        monster.hunger = Math.min(100, monster.hunger + 20);
        monster.energy = Math.max(0, monster.energy - 5);
        if (Math.random() < 0.3) {
            monster.poopCount = Math.min(3, monster.poopCount + 1);
        }
        updateStats();
    }

    function clean() {
        if (monster.poopCount > 0) {
            monster.poopCount = 0;
            monster.happiness = Math.min(100, monster.happiness + 10);
            showNotification("สะอาดแล้ว!");
        } else {
            showNotification("ไม่เห็นมีอะไรให้ทำความสะอาดเลย");
        }
        updateStats();
    }

    function play() {
        if (monster.energy <= 10) {
            showNotification("มันเหนื่อยเกินไปที่จะเล่น");
            return;
        }
        monster.happiness = Math.min(100, monster.happiness + 15);
        monster.energy = Math.max(0, monster.energy - 10);
        updateStats();
    }

    function endGame(reason) {
        clearInterval(gameLoop);
        monsterImage.style.filter = 'grayscale(100%)';
        showNotification(reason);
        feedButton.disabled = true;
        cleanButton.disabled = true;
        playButton.disabled = true;
        localStorage.removeItem(SAVE_KEY); // Clear save data on game over
    }

    // --- Event Listeners ---
    feedButton.addEventListener('click', feed);
    cleanButton.addEventListener('click', clean);
    playButton.addEventListener('click', play);

    // --- Game Loop ---
    const gameLoop = setInterval(() => {
        monster.hunger = Math.max(0, monster.hunger - 2);
        monster.happiness = Math.max(0, monster.happiness - 1);
        
        if (monster.poopCount > 0) {
            monster.happiness = Math.max(0, monster.happiness - 3);
        }

        updateStats();
        saveGame(); // Auto-save every loop
    }, 3000);

    // Initial setup
    loadGame();
});
            if (response.ok) {
                showNotification("เกมถูกบันทึกแล้ว!");
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Save Error:', error);
            showNotification("บันทึกเกมไม่สำเร็จ");
        }
    }

    async function loadGame() {
        try {
            const response = await fetch('/api/load');
            if (response.ok) {
                const savedState = await response.json();
                monster = savedState;
                showNotification("โหลดข้อมูลสำเร็จ!");
            } else {
                showNotification("สวัสดี! ฉันคือดิจิมอนคู่หูของนาย!");
            }
        } catch (error) {
            console.error('Load Error:', error);
            showNotification("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        } finally {
            updateStats();
        }
    }

    // --- Event Listeners ---
    feedButton.addEventListener('click', feed);
    cleanButton.addEventListener('click', clean);
    playButton.addEventListener('click', play);
    saveButton.addEventListener('click', saveGame); // New

    // --- Game Loop ---
    const gameLoop = setInterval(() => {
        monster.hunger = Math.max(0, monster.hunger - 2);
        monster.happiness = Math.max(0, monster.happiness - 1);
        
        if (monster.poopCount > 0) {
            monster.happiness = Math.max(0, monster.happiness - 3);
        }

        updateStats();
    }, 3000);

    // Initial setup
    loadGame();
});
