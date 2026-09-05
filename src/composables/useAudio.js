import { ref } from 'vue'

import spinUrl from '../assets/audio/spin.wav'
import winUrl from '../assets/audio/win.mp3'
import clickUrl from '../assets/audio/click.mp3'

export function useAudio() {
  const spinAudio = new Audio(spinUrl)
  spinAudio.loop = true
  spinAudio.volume = 0.4
  spinAudio.preload = 'auto'

  const winAudio = new Audio(winUrl)
  winAudio.volume = 0.6

  const clickAudio = new Audio(clickUrl)
  clickAudio.volume = 0.3

  // Only unlock ONCE on first user interaction
  let isUnlocked = false
  
  const unlockAudio = () => {
    if (isUnlocked) return
    isUnlocked = true
    
    // Play and immediately pause to unlock the audio context
    spinAudio.play().then(() => {
      spinAudio.pause()
      spinAudio.currentTime = 0
    }).catch(() => {})
  }

  const playSpin = () => {
    unlockAudio()
    spinAudio.currentTime = 0
    spinAudio.play().catch(e => console.warn('Spin audio blocked:', e))
  }

  const stopSpin = () => {
    spinAudio.pause()
    spinAudio.currentTime = 0
  }

  const playWin = () => {
    winAudio.currentTime = 0
    winAudio.play().catch(e => console.warn('Win audio blocked:', e))
  }

  const playClick = () => {
    clickAudio.currentTime = 0
    clickAudio.play().catch(e => console.warn('Click audio blocked:', e))
  }

  return { playSpin, stopSpin, playWin, playClick }
}