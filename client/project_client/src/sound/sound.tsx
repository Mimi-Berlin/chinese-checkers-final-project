// src/sound/sound.tsx

import clickSoundFile from './click.mp3';
import gameMusicFile from './game_music.mp3'; // ודא שקובץ זה קיים בתיקייה src/sound

let clickSound: HTMLAudioElement | null = null;
let gameMusic: HTMLAudioElement | null = null; // משתנה למוזיקת רקע

export const playClickSound = () => {
  if (clickSound === null) {
    clickSound = new Audio(clickSoundFile);
    clickSound.volume = 0.5; // התאם ווליום לקליק
  }

  clickSound.currentTime = 0;
  clickSound.play().catch(error => {
    console.warn("Failed to play click sound:", error);
  });
};

export const startBackgroundMusic = () => {
  if (gameMusic === null) {
    gameMusic = new Audio(gameMusicFile);
    gameMusic.loop = true; // הפעל בלופ
    gameMusic.volume = 0.1; // ווליום נמוך למוזיקת רקע (התאם לפי הצורך)
  }
  // בדוק אם המוזיקה לא כבר מתנגנת לפני הפעלה
  if (gameMusic.paused) {
    gameMusic.play().catch(error => {
      console.warn("Failed to play background music:", error);
    });
  }
};

export const stopBackgroundMusic = () => {
  if (gameMusic !== null && !gameMusic.paused) {
    gameMusic.pause();
    gameMusic.currentTime = 0; // אפס את הצליל להתחלה
  }
};