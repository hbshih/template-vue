<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import PhaserGame from './PhaserGame.vue';
import BattleScreen from './components/BattleScreen.vue';
import CollectionScreen from './components/CollectionScreen.vue';
import EncounterDialog from './components/EncounterDialog.vue';
import ShareModal from './components/ShareModal.vue';
import { EventBus } from './game/EventBus';
import guestDataManager from './game/GuestData';

// Game state
const phaserRef = ref();
const showBattle = ref(false);
const showCollection = ref(false);
const showEncounter = ref(false);
const encounterNPC = ref(null);

// Player data
const playerName = ref('Player');
const showShareModal = ref(false);

// Audio control
const isMuted = ref(false);

// Player stats
const playerStats = ref({
  level: 1,
  xp: 0,
  hp: 100,
  maxHp: 100,
  rightAnswers: 0,
  wrongAnswers: 0,
  totalBattles: 0
});

// XP needed for each level (exponential growth)
const getXPForLevel = (level) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Current XP needed for next level
const xpForNextLevel = computed(() => getXPForLevel(playerStats.value.level + 1));

// Mock battle data
const battleData = ref({
  guest: {
    id: "1",
    name: "Shreyas Doshi",
    sprite: "👤",
    hp: 100,
    episode: "Product Management Excellence",
    difficulty: "Hard"
  },
  questions: [
    {
      id: 1,
      type: "mcq",
      prompt: "What is the most important framework for prioritizing product features?",
      choices: [
        "RICE scoring",
        "Impact vs Effort matrix",
        "Both are equally important",
        "Customer feedback only"
      ],
      correctAnswer: 1,
      explanation: "While both frameworks are useful, the Impact vs Effort matrix is more flexible and commonly used."
    },
    {
      id: 2,
      type: "tf",
      prompt: "Product-market fit can be measured primarily through NPS scores.",
      choices: ["True", "False"],
      correctAnswer: 1,
      explanation: "PMF is better measured through retention and growth metrics, not just NPS."
    },
    {
      id: 3,
      type: "mcq",
      prompt: "What percentage of features should be customer-driven vs vision-driven?",
      choices: [
        "90% customer, 10% vision",
        "50/50 split",
        "70% vision, 30% customer",
        "It depends on company stage"
      ],
      correctAnswer: 3,
      explanation: "The balance depends heavily on whether you're in discovery, growth, or maturity phase."
    },
    {
      id: 4,
      type: "mcq",
      prompt: "Which metric matters most for SaaS products?",
      choices: [
        "Monthly Active Users",
        "Revenue per customer",
        "Net retention rate",
        "Churn rate"
      ],
      correctAnswer: 2,
      explanation: "Net retention rate shows both growth and customer satisfaction combined."
    },
    {
      id: 5,
      type: "tf",
      prompt: "Good PMs should spend 80% of their time with customers.",
      choices: ["True", "False"],
      correctAnswer: 1,
      explanation: "While customer contact is important, PMs need to balance strategy, team coordination, and execution."
    }
  ]
});

// Collection data - will be populated from GuestDataManager
const collection = ref([]);

// Computed stats
const capturedCount = computed(() => collection.value.filter(g => g.captured).length);
const totalGuests = computed(() => collection.value.length);
const accuracy = computed(() => {
  const total = playerStats.value.rightAnswers + playerStats.value.wrongAnswers;
  return total > 0 ? Math.round((playerStats.value.rightAnswers / total) * 100) : 0;
});

// Event handlers
function handleStartBattle() {
  showBattle.value = true;
}

function handleCloseBattle() {
  console.log('handleCloseBattle called in App.vue');
  showBattle.value = false;
  // Re-enable input in Overworld
  EventBus.emit('battle-ended');
}

function handleOpenCollection() {
  showCollection.value = true;
}

function handleCloseCollection() {
  showCollection.value = false;
}

function handleShowEncounter(npcData) {
  encounterNPC.value = npcData;
  showEncounter.value = true;
}

function handleAcceptBattle() {
  console.log('handleAcceptBattle called with encounterNPC:', encounterNPC.value);
  showEncounter.value = false;

  // Notify Overworld that battle is starting (disable NPC interaction checks)
  EventBus.emit('battle-starting');

  // Set battle data based on encounterNPC
  if (encounterNPC.value) {
    const guest = collection.value.find(g => g.id === encounterNPC.value.id);
    console.log('Found guest for battle:', guest);
    if (guest) {
      battleData.value.guest = guest;

      // Load questions from GuestDataManager
      const questions = guestDataManager.getRandomQuestions(guest.id, 5);
      console.log('Questions loaded for battle:', questions);

      if (questions && questions.length > 0) {
        // Update battle data with real questions
        battleData.value.questions = questions.map((q, index) => ({
          id: index + 1,
          type: "mcq",
          prompt: q.question,
          choices: q.options,
          correctAnswer: q.options.indexOf(q.answer),
          explanation: `The correct answer is: ${q.answer}`
        }));
        console.log('Formatted battle questions:', battleData.value.questions);
      } else {
        console.error('No questions found for guest:', guest.id, guest.name);
      }
    }
  }
  showBattle.value = true;
}

function handleRejectBattle() {
  showEncounter.value = false;
  encounterNPC.value = null;
  // Notify Phaser that battle was rejected
  EventBus.emit('battle-rejected');
}

function handleGuestCaptured(guestId) {
  const guest = collection.value.find(g => g.id === guestId);
  if (guest) {
    guest.captured = true;
    // Award XP for capturing a guest (battle win)
    gainXP(50);
    playerStats.value.totalBattles++;
  }
}

function handleAnswerResult(isCorrect) {
  if (isCorrect) {
    playerStats.value.rightAnswers++;
    gainXP(10); // 10 XP per correct answer
  } else {
    playerStats.value.wrongAnswers++;
    // Lose HP on wrong answer
    playerStats.value.hp = Math.max(0, playerStats.value.hp - 10);
  }
}

function gainXP(amount) {
  playerStats.value.xp += amount;

  // Check for level up
  while (playerStats.value.xp >= xpForNextLevel.value) {
    levelUp();
  }
}

function levelUp() {
  playerStats.value.xp -= xpForNextLevel.value;
  playerStats.value.level++;

  // Increase max HP by 20 each level
  playerStats.value.maxHp += 20;

  // Restore HP to full on level up
  playerStats.value.hp = playerStats.value.maxHp;

  // Show level up notification
  alert(`🎉 Level Up! You are now level ${playerStats.value.level}!\n💚 HP increased to ${playerStats.value.maxHp}`);
}

function handleShareStats() {
  // Show share modal instead of immediately sharing
  showShareModal.value = true;
}

function setPlayerName(name) {
  playerName.value = name || 'Player';
}

function toggleMute() {
  isMuted.value = !isMuted.value;
  // Save mute preference to localStorage
  localStorage.setItem('pokelenny-muted', isMuted.value.toString());
  // Emit mute state to Phaser
  EventBus.emit('toggle-mute', isMuted.value);
}

onMounted(() => {
  // Listen for guests-loaded event from Preloader
  EventBus.on('guests-loaded', (guests) => {
    console.log('✓ Guests loaded event received:', guests.length, 'guests');
    collection.value = guests;
    console.log('Collection IDs:', collection.value.map(g => g.id).join(', '));
  });

  // Fallback: Initialize collection from GuestDataManager (loaded by Preloader)
  // Try multiple times until guests are loaded
  let attempts = 0;
  const maxAttempts = 50; // Increased from 20
  const checkInterval = setInterval(() => {
    if (collection.value.length > 0) {
      // Already loaded via event
      clearInterval(checkInterval);
      return;
    }
    attempts++;
    const selectedGuests = guestDataManager.getSelectedGuests();
    console.log(`Collection init attempt ${attempts}: found ${selectedGuests.length} guests`);
    if (selectedGuests.length > 0) {
      collection.value = selectedGuests;
      console.log(`✓ Initialized collection with ${selectedGuests.length} guests:`, selectedGuests.map(g => `${g.id}:${g.name}`).slice(0, 5));
      clearInterval(checkInterval);
    } else if (attempts >= maxAttempts) {
      console.error('❌ Failed to load guests after', attempts, 'attempts');
      clearInterval(checkInterval);
    }
  }, 200); // Check every 200ms

  // Load mute preference from localStorage
  const savedMuteState = localStorage.getItem('pokelenny-muted');
  if (savedMuteState !== null) {
    isMuted.value = savedMuteState === 'true';
    // Apply mute state to Phaser
    setTimeout(() => {
      EventBus.emit('toggle-mute', isMuted.value);
    }, 1000); // Wait for game to initialize
  }

  // Show encounter dialog when approaching NPC
  EventBus.on('show-encounter-dialog', (data) => {
    console.log('App.vue received show-encounter-dialog event:', data);
    console.log('Collection length:', collection.value.length);
    if (data && data.id) {
      const guest = collection.value.find(g => g.id === data.id);
      console.log('Found guest for encounter:', guest);
      if (guest) {
        handleShowEncounter(guest);
        console.log('showEncounter set to:', showEncounter.value);
      } else {
        console.warn('Guest not found in collection. Guest ID:', data.id, 'Collection IDs:', collection.value.map(g => g.id).join(', '));
      }
    }
  });

  // Hide encounter dialog when walking away
  EventBus.on('hide-encounter-dialog', () => {
    showEncounter.value = false;
    encounterNPC.value = null;
  });

  // Start battle directly (skip encounter dialog)
  EventBus.on('start-battle', (data) => {
    console.log('start-battle event received:', data);
    if (data && data.guestId) {
      const guest = collection.value.find(g => g.id === data.guestId);
      console.log('Found guest for battle:', guest);
      if (guest) {
        battleData.value.guest = guest;
        // Get 5 random questions for this guest from GuestDataManager
        const questions = guestDataManager.getRandomQuestions(data.guestId, 5);
        console.log('Questions loaded for battle:', questions);
        if (questions && questions.length > 0) {
          // Update battle data with real questions
          battleData.value.questions = questions.map((q, index) => ({
            id: index + 1,
            type: "mcq",
            prompt: q.question,
            choices: q.options,
            correctAnswer: q.options.indexOf(q.answer),
            explanation: `The correct answer is: ${q.answer}`
          }));
          console.log('Formatted battle questions:', battleData.value.questions);
        }
        showBattle.value = true;
      }
    }
  });

  EventBus.on('open-collection', handleOpenCollection);
  EventBus.on('player-name-set', (name) => {
    setPlayerName(name);
  });
});

onUnmounted(() => {
  EventBus.off('guests-loaded');
  EventBus.off('show-encounter-dialog');
  EventBus.off('hide-encounter-dialog');
  EventBus.off('start-battle');
  EventBus.off('open-collection', handleOpenCollection);
  EventBus.off('player-name-set');
});
</script>

<template>
  <div id="app">
    <div class="game-header">
      <h1 class="game-title">PokéLenny</h1>
      <p class="game-subtitle">Catch 'Em All!</p>
    </div>

    <div class="game-wrapper">
      <div class="stats-bar">
        <div class="stat-item level-stat">
          <span class="stat-label">Level {{ playerStats.level }}</span>
          <div class="xp-bar-container">
            <div class="xp-bar" :style="{ width: (playerStats.xp / xpForNextLevel * 100) + '%' }"></div>
          </div>
          <span class="stat-value-small">{{ playerStats.xp }}/{{ xpForNextLevel }} XP</span>
        </div>
        <div class="stat-item hp-stat">
          <span class="stat-label">HP</span>
          <div class="hp-bar-container">
            <div class="hp-bar" :style="{ width: (playerStats.hp / playerStats.maxHp * 100) + '%' }"></div>
          </div>
          <span class="stat-value">{{ playerStats.hp }}/{{ playerStats.maxHp }}</span>
        </div>
        <div class="stat-item collection-stat">
          <span class="stat-label">Captured</span>
          <span class="stat-value">{{ capturedCount }}/{{ totalGuests }}</span>
        </div>
      </div>

      <PhaserGame ref="phaserRef" />

      <div class="action-buttons">
        <button class="action-btn collection-btn" @click="handleOpenCollection">
          📚 Collection
        </button>
        <button class="action-btn share-btn" @click="handleShareStats">
          📤 Share Stats
        </button>
        <button class="action-btn mute-btn" @click="toggleMute" :title="isMuted ? 'Unmute' : 'Mute'">
          {{ isMuted ? '🔇' : '🔊' }}
        </button>
      </div>
    </div>

    <div class="game-controls">
      <p><strong>Controls:</strong> Arrow Keys/WASD - Move | Walk near NPCs to interact | C - View Collection</p>
    </div>

    <EncounterDialog
      :isActive="showEncounter"
      :npcData="encounterNPC || {}"
      @accept="handleAcceptBattle"
      @reject="handleRejectBattle"
    />

    <BattleScreen
      :isActive="showBattle"
      :battleData="battleData"
      :playerName="playerName"
      :playerStats="playerStats"
      @close="handleCloseBattle"
      @guest-captured="handleGuestCaptured"
      @answer-submitted="handleAnswerResult"
    />

    <CollectionScreen
      :isActive="showCollection"
      :collection="collection"
      @close="handleCloseCollection"
    />

    <ShareModal
      :isActive="showShareModal"
      :playerName="playerName"
      :stats="playerStats"
      :collection="collection"
      :capturedCount="capturedCount"
      :totalGuests="totalGuests"
      :accuracy="accuracy"
      @close="showShareModal = false"
    />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

#app {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  gap: 20px;
  padding: 20px;
}

.game-header {
  text-align: center;
  color: #fff;
  font-family: 'Press Start 2P', monospace, sans-serif;
  text-shadow: 3px 3px 0px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
}

.game-title {
  font-size: 36px;
  margin: 0 0 8px 0;
  color: #FFD700;
  text-shadow:
    3px 3px 0px rgba(0, 0, 0, 0.8),
    0 0 15px rgba(255, 215, 0, 0.5);
}

.game-subtitle {
  font-size: 14px;
  margin: 0;
  letter-spacing: 2px;
  color: #fff;
  font-family: 'Press Start 2P', monospace, sans-serif;
}

.game-wrapper {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-shrink: 0;
}

.stats-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(0, 0, 0, 0.85);
  border: 3px solid #FFD700;
  border-radius: 8px;
  padding: 16px;
  min-width: 180px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 9px;
  color: #FFD700;
  text-transform: uppercase;
}

.stat-value {
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 14px;
  color: #fff;
}

.stat-value-small {
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 9px;
  color: #fff;
}

.hp-bar-container,
.xp-bar-container {
  width: 100%;
  height: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid #333;
  border-radius: 4px;
  overflow: hidden;
}

.hp-bar {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.6);
}

.xp-bar {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.6);
}

#game-container {
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 4px solid #FFD700;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 180px;
}

.action-btn {
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 11px;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  border: 3px solid #FFD700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.3);
  text-align: center;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.3);
  background: rgba(20, 20, 20, 0.9);
}

.action-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.3);
}

.collection-btn {
  border-color: #60a5fa;
}

.collection-btn:hover {
  border-color: #3b82f6;
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(96, 165, 250, 0.4);
}

.share-btn {
  border-color: #a78bfa;
}

.share-btn:hover {
  border-color: #8b5cf6;
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(167, 139, 250, 0.4);
}

.mute-btn {
  border-color: #fbbf24;
  font-size: 18px;
  padding: 12px 14px;
  min-width: 50px;
}

.mute-btn:hover {
  border-color: #f59e0b;
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(251, 191, 36, 0.4);
}

.game-controls {
  background: rgba(0, 0, 0, 0.85);
  border: 3px solid #FFD700;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 10px;
  text-align: center;
  color: #fff;
  font-family: 'Press Start 2P', monospace, sans-serif;
  flex-shrink: 0;
  max-width: 960px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  line-height: 1.6;
}

.game-controls p {
  margin: 0;
}

.game-controls strong {
  color: #FFD700;
}

@media (max-width: 1300px) {
  .game-wrapper {
    flex-direction: column;
    gap: 12px;
  }

  .stats-bar,
  .action-buttons {
    flex-direction: row;
    min-width: auto;
    width: 100%;
    max-width: 960px;
    justify-content: space-around;
  }

  .stat-item {
    flex: 1;
    min-width: 120px;
  }

  .action-buttons {
    max-width: 500px;
  }
}

@media (max-width: 1024px) {
  #app {
    gap: 15px;
    padding: 15px;
  }

  .game-title {
    font-size: 28px;
  }

  .game-subtitle {
    font-size: 12px;
  }

  .game-controls {
    font-size: 9px;
    padding: 10px 20px;
  }

  .action-btn {
    font-size: 10px;
    padding: 12px 14px;
  }
}

@media (max-width: 768px) {
  #app {
    gap: 10px;
    padding: 10px;
  }

  .game-title {
    font-size: 20px;
  }

  .game-subtitle {
    font-size: 10px;
  }

  .game-controls {
    font-size: 8px;
    padding: 8px 16px;
  }

  .stat-label {
    font-size: 8px;
  }

  .stat-value {
    font-size: 12px;
  }

  .action-btn {
    font-size: 9px;
    padding: 10px 12px;
  }
}
</style>
