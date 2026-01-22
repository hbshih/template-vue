/**
 * GuestData.js
 * Handles loading and processing guest data from questions.json and avatar images
 */

class GuestDataManager {
  constructor() {
    this.allGuests = [];
    this.selectedGuests = [];
  }

  /**
   * Load and process questions.json data
   * @param {Object} questionsData - Parsed JSON from questions.json
   * @returns {Array} Array of all available guests with their data
   */
  loadQuestionsData(questionsData) {
    const guests = [];

    if (!questionsData || !questionsData.episodes) {
      console.error('Invalid questions data format');
      return guests;
    }

    questionsData.episodes.forEach((episode, index) => {
      const guestName = episode.guest || episode.title;

      // Check if guest has questions
      if (!episode.questions || episode.questions.length === 0) {
        console.warn(`Guest ${guestName} has no questions, skipping`);
        return;
      }

      // Create guest object
      const guest = {
        id: String(index + 1).padStart(3, '0'),
        name: guestName,
        episode: episode.title,
        questions: episode.questions,
        avatarKey: this.generateAvatarKey(guestName),
        sprite: '🎙️', // Default sprite emoji
        difficulty: this.calculateDifficulty(episode.questions.length),
        captured: false
      };

      guests.push(guest);
    });

    this.allGuests = guests;
    console.log(`Loaded ${guests.length} guests from questions.json`);
    return guests;
  }

  /**
   * Generate asset key for avatar image
   * @param {string} guestName - Name of the guest
   * @returns {string} Asset key for Phaser loader
   */
  generateAvatarKey(guestName) {
    // Clean the name first (remove version numbers, etc.)
    const cleanName = this.cleanGuestName(guestName);
    // Convert "Ada Chen Rekhi" to "ada-chen-rekhi" for asset key
    // Also clean up special characters
    return `avatar-${cleanName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[&+]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')}`;
  }

  /**
   * Clean guest name for avatar file matching
   * @param {string} guestName - Name of the guest
   * @returns {string} Cleaned name
   */
  cleanGuestName(guestName) {
    // Remove version numbers like " 2.0", " 3.0", etc.
    let cleaned = guestName.replace(/\s+\d+\.\d+$/, '');
    // Remove trailing underscore if any
    cleaned = cleaned.replace(/_$/, '');
    return cleaned.trim();
  }

  /**
   * Generate file path for avatar image
   * @param {string} guestName - Name of the guest
   * @returns {string} Path to avatar file
   */
  generateAvatarPath(guestName) {
    // Special case for Elena - use elena-front.png
    if (guestName.includes('Elena Verna')) {
      return 'elena-front.png';
    }

    // Clean the name first (remove version numbers, etc.)
    const cleanName = this.cleanGuestName(guestName);
    // Convert "Ada Chen Rekhi" to "Ada Chen Rekhi_pixel_art.png"
    return `avatars/${cleanName}_pixel_art.png`;
  }

  /**
   * Calculate difficulty based on number of questions
   * @param {number} questionCount - Number of questions for this guest
   * @returns {string} Difficulty level
   */
  calculateDifficulty(questionCount) {
    if (questionCount <= 3) return 'Easy';
    if (questionCount <= 6) return 'Medium';
    return 'Hard';
  }

  /**
   * Top 20 most famous/popular guests that should always appear
   */
  getTopGuests() {
    return [
      'Elena Verna',
      'Shreyas Doshi',
      'Casey Winters',
      'April Dunford',
      'Marty Cagan',
      'Julie Zhuo',
      'Nir Eyal',
      'Des Traynor',
      'Melissa Perri',
      'Lenny Rachitsky',
      'Reforge',
      'Adam Fishman',
      'Bangaly Kaba',
      'Fareed Mosavat',
      'Gokul Rajaram',
      'Ken Norton',
      'Merci Grace',
      'Ravi Mehta',
      'Jackie Bavaro',
      'Hubert Palan'
    ];
  }

  /**
   * Select N random guests from all available guests
   * Top 20 most famous guests are always included
   * @param {number} count - Number of guests to select (default 30)
   * @returns {Array} Array of selected guests
   */
  selectRandomGuests(count = 30) {
    if (this.allGuests.length === 0) {
      console.error('No guests loaded. Call loadQuestionsData first.');
      return [];
    }

    const selected = [];
    const topGuestNames = this.getTopGuests();

    // First, add the top 20 famous guests
    const topGuests = this.allGuests.filter(guest =>
      topGuestNames.some(name => guest.name.includes(name))
    );

    console.log(`Found ${topGuests.length} top guests from list of ${topGuestNames.length}`);

    // Find Elena and ensure she's first
    const elenaIndex = topGuests.findIndex(g => g.name.includes('Elena Verna'));
    if (elenaIndex > -1) {
      // Remove Elena from her current position
      const elena = topGuests.splice(elenaIndex, 1)[0];
      // Add Elena first
      selected.push({ ...elena });
    }

    // Add remaining top guests
    topGuests.forEach(guest => {
      selected.push({ ...guest });
    });

    // Calculate how many more guests we need
    const remainingCount = count - selected.length;

    if (remainingCount > 0) {
      // Get guests that are NOT in the top list
      const otherGuests = this.allGuests.filter(guest =>
        !topGuestNames.some(name => guest.name.includes(name))
      );

      // Shuffle and select random guests from the remaining pool
      const shuffled = [...otherGuests].sort(() => Math.random() - 0.5);
      const randomGuests = shuffled.slice(0, Math.min(remainingCount, shuffled.length));

      randomGuests.forEach(guest => {
        selected.push({ ...guest });
      });
    }

    // Reassign IDs based on selection order
    selected.forEach((guest, index) => {
      guest.id = String(index + 1).padStart(3, '0');
    });

    this.selectedGuests = selected;
    console.log(`Selected ${selected.length} guests: ${topGuests.length + 1} top guests (Elena first) + ${selected.length - topGuests.length - 1} random guests`);
    return selected;
  }

  /**
   * Get list of avatar paths to preload
   * @returns {Array} Array of {key, path} objects for Phaser loader
   */
  getAvatarsToLoad() {
    return this.selectedGuests.map(guest => ({
      key: guest.avatarKey,
      path: this.generateAvatarPath(guest.name),
      guestName: guest.name
    }));
  }

  /**
   * Get random questions for a specific guest
   * @param {string} guestId - ID of the guest
   * @param {number} count - Number of questions to get (default 5)
   * @returns {Array} Array of question objects
   */
  getRandomQuestions(guestId, count = 5) {
    const guest = this.selectedGuests.find(g => g.id === guestId);

    if (!guest || !guest.questions || guest.questions.length === 0) {
      console.error(`No questions found for guest ${guestId}`);
      return [];
    }

    // If guest has fewer questions than requested, return all
    if (guest.questions.length <= count) {
      return [...guest.questions];
    }

    // Randomly select 'count' questions
    const shuffled = [...guest.questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get a random question for a specific guest (single question)
   * @param {string} guestId - ID of the guest
   * @returns {Object} Question object with question, options, and answer
   */
  getRandomQuestion(guestId) {
    const questions = this.getRandomQuestions(guestId, 1);
    return questions.length > 0 ? questions[0] : null;
  }

  /**
   * Get guest data by ID
   * @param {string} guestId - ID of the guest
   * @returns {Object} Guest object
   */
  getGuest(guestId) {
    return this.selectedGuests.find(g => g.id === guestId);
  }

  /**
   * Get all selected guests
   * @returns {Array} Array of selected guest objects
   */
  getSelectedGuests() {
    return this.selectedGuests;
  }

  /**
   * Reset the selection (for new game)
   */
  reset() {
    this.selectedGuests = [];
  }
}

// Create singleton instance
const guestDataManager = new GuestDataManager();

export default guestDataManager;
