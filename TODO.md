# PokéLenny - Development TODO

## ✅ Completed Features

### Core Game Systems
- [x] Main Menu with player name input
- [x] Start screen design (vibrant, logo-matched aesthetic)
- [x] Overworld exploration with tile-based movement
- [x] Large city map (3x original size, 150 NPCs)
- [x] Minimap in bottom-right corner
- [x] NPC encounter detection (5-tile range)
- [x] Pokemon-style encounter dialog
- [x] Battle screen with Q&A mechanics
- [x] Keyboard navigation in battles (Arrow keys + Enter)
- [x] Battle screen UI (opponent top-right, player bottom-left)
- [x] HP display for both fighters
- [x] Collection screen to view defeated guests
- [x] EventBus for Vue-Phaser communication
- [x] Font loading system (Press Start 2P)
- [x] Scene transitions (MainMenu → Overworld → Battle)

### UI/UX Polish
- [x] Responsive text sizing
- [x] Hover states for buttons
- [x] Input field cleanup on scene transitions
- [x] Battle background image integration
- [x] Color scheme matching logo (greens, golds, yellows)
- [x] Particle effects on main menu

---

## 🚧 High Priority - Core Content

### 1. Question Database
**Status:** Waiting for content from user
**Description:** Create trivia questions about Lenny's podcast guests

**Tasks:**
- [ ] Create `src/game/data/questions.js` structure
- [ ] Define question format:
  ```js
  {
    id: string,
    guestId: string,
    question: string,
    answers: [string, string, string, string],
    correctAnswerIndex: number,
    difficulty: 'easy' | 'medium' | 'hard',
    episode: string (optional),
    topic: string (optional)
  }
  ```
- [ ] Import actual questions (waiting for user)
- [ ] Implement question loading by guest
- [ ] Add question randomization
- [ ] Ensure no duplicate questions per battle

### 2. Guest Data System
**Status:** Waiting for content from user
**Description:** Real guest information and metadata

**Tasks:**
- [ ] Create `src/game/data/guests.js` structure
- [ ] Define guest format:
  ```js
  {
    id: string,
    name: string,
    episode: string,
    bio: string,
    topics: [string],
    difficulty: 'easy' | 'medium' | 'hard',
    sprite: string (asset path),
    maxHP: number,
    questions: [questionId]
  }
  ```
- [ ] Import actual guest data (waiting for user)
- [ ] Map guests to NPCs in Overworld
- [ ] Add guest portraits/sprites

---

## 🎯 High Priority - Game Mechanics

### 3. Progression System
**Status:** Not started
**Description:** Track player progress and unlock content

**Tasks:**
- [ ] Track defeated guests in game state
- [ ] Prevent re-battling defeated guests
- [ ] Visual indicator for defeated NPCs (greyed out, different sprite)
- [ ] Unlock new areas based on progress
- [ ] Difficulty scaling (harder guests unlock after easier ones)
- [ ] Win condition (defeat all guests or specific percentage)
- [ ] Loss handling (allow retry, track losses)

### 4. Save System
**Status:** Not started
**Description:** Persist player progress using LocalStorage

**Tasks:**
- [ ] Create save/load manager
- [ ] Save data structure:
  ```js
  {
    playerName: string,
    defeatedGuests: [guestId],
    totalBattles: number,
    wins: number,
    losses: number,
    currentScore: number,
    achievements: [achievementId],
    lastPlayed: timestamp
  }
  ```
- [ ] Auto-save after each battle
- [ ] Load saved game on startup
- [ ] "Continue" vs "New Game" option on main menu
- [ ] Reset progress option

### 5. Battle Improvements
**Status:** Partially complete
**Description:** Enhance battle experience

**Tasks:**
- [ ] HP damage calculation based on correct/incorrect answers
- [ ] Visual feedback for correct answers (green flash, +score popup)
- [ ] Visual feedback for wrong answers (red flash, HP decrease animation)
- [ ] Victory screen with stats (questions answered, accuracy, time)
- [ ] Defeat screen with retry option
- [ ] Battle timer (optional)
- [ ] Score multipliers for streaks
- [ ] Hint system (use once per battle)

---

## 🎨 Medium Priority - Polish & UX

### 6. Visual Improvements
**Status:** Not started
**Description:** Better graphics and animations

**Tasks:**
- [ ] Add actual guest sprites/portraits (waiting for assets)
- [ ] Character sprites for different directions (up, down, left, right)
- [ ] Battle entry animation (screen shake, flash)
- [ ] Battle exit animation (fade out)
- [ ] HP bar animations (smooth decrease)
- [ ] Damage numbers floating up
- [ ] Victory animation (confetti, sparkles)
- [ ] Defeat animation (fade to grey)
- [ ] Scene transition effects (fade, slide)
- [ ] Loading screen between scenes

### 7. Audio System
**Status:** Not started
**Description:** Add music and sound effects

**Tasks:**
- [ ] Background music for Main Menu
- [ ] Background music for Overworld
- [ ] Battle music (different track)
- [ ] Victory fanfare
- [ ] Defeat sound
- [ ] Correct answer sound (ding, chime)
- [ ] Wrong answer sound (buzzer)
- [ ] Menu navigation sounds (click, hover)
- [ ] NPC encounter sound (attention grabber)
- [ ] Volume controls in settings
- [ ] Mute toggle

### 8. Mobile Optimization
**Status:** Not started
**Description:** Make game playable on mobile devices

**Tasks:**
- [ ] Touch controls for movement
- [ ] Virtual D-pad overlay
- [ ] Responsive canvas scaling
- [ ] Touch-friendly UI (larger buttons)
- [ ] Orientation handling (portrait/landscape)
- [ ] Performance optimization for mobile
- [ ] Test on iOS and Android

---

## 🚀 Low Priority - Advanced Features

### 9. Rewards & Achievements
**Status:** Not started
**Description:** Add collectibles and incentives

**Tasks:**
- [ ] Achievement system:
  - Defeat your first guest
  - Defeat 10 guests
  - Perfect battle (no wrong answers)
  - Speed demon (complete battle in under X seconds)
  - Topic master (defeat all guests in a topic)
  - etc.
- [ ] Collectible badges display
- [ ] Unlock special guests after achievements
- [ ] Cosmetic rewards (player sprite variants)
- [ ] Easter eggs hidden in the map

### 10. Leaderboard
**Status:** Not started
**Description:** Compare scores with other players

**Tasks:**
- [ ] Local leaderboard (top 10 scores)
- [ ] Score calculation algorithm
- [ ] Leaderboard UI screen
- [ ] Optional: Backend integration for global leaderboard
- [ ] Optional: Firebase/Supabase integration
- [ ] Share score on social media

### 11. Additional Game Modes
**Status:** Not started
**Description:** Alternative ways to play

**Tasks:**
- [ ] Time Trial mode (defeat as many guests as possible in X minutes)
- [ ] Endless mode (questions keep coming until wrong answer)
- [ ] Daily Challenge (specific guest/questions rotate daily)
- [ ] Boss battles (harder guests with special mechanics)
- [ ] Co-op mode (optional, two players team up)

### 12. Settings & Accessibility
**Status:** Not started
**Description:** Player preferences and accessibility

**Tasks:**
- [ ] Settings menu
- [ ] Volume controls (music, SFX)
- [ ] Text size options
- [ ] Color blind modes
- [ ] High contrast mode
- [ ] Keyboard remapping
- [ ] Tutorial/Help screen
- [ ] Credits screen

---

## 🐛 Bug Fixes & Technical Debt

### Known Issues
- [x] Input box appearing during gameplay (FIXED)
- [x] Font not loading properly (FIXED)
- [ ] Check for memory leaks on scene transitions
- [ ] Optimize NPC count for performance
- [ ] Test all scenes for cleanup on shutdown

### Code Quality
- [ ] Add JSDoc comments to all functions
- [ ] Refactor battle logic into separate manager class
- [ ] Create reusable UI components
- [ ] Add error handling for missing assets
- [ ] Write unit tests for game logic
- [ ] Create development/production build configs

---

## 📝 Documentation

- [ ] Create PRD.md (Product Requirements Document)
- [ ] Document EventBus events
- [ ] Create asset requirements doc (sprites, audio)
- [ ] Write contribution guidelines
- [ ] Add inline code comments
- [ ] Create deployment guide

---

## 🎯 Next Immediate Steps

1. **Waiting for user:** Question database content
2. **Waiting for user:** Guest data content
3. **Can start now:** Save system implementation
4. **Can start now:** Battle improvements (HP damage, visual feedback)
5. **Can start now:** Audio system setup (even with placeholder sounds)

---

## 📊 Progress Tracking

**Current Version:** v0.5
**Completion Status:** ~40% (core mechanics done, content and polish needed)
**Estimated to MVP:** 60% remaining
**Blockers:** Need question/guest content from user

---

*Last Updated: 2026-01-21*
