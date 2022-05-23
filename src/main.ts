import './style.css'
import {Game} from "./Game";
import {Player} from "./Player/Player";
import {AIPlayer} from "./Player/AIPlayer";
import {KeyboardInput} from "./Player/KeyboardInput";
import {HEIGHT, WIDTH} from "./helpers/Constants";

const gameCanvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')!
const textCanvas = document.querySelector<HTMLCanvasElement>('#textCanvas')!
gameCanvas.width = WIDTH
gameCanvas.height = HEIGHT
textCanvas.width = WIDTH
textCanvas.height = HEIGHT
const selectPlayer1 = document.querySelector<HTMLSelectElement>('#player1')!
const selectPlayer2 = document.querySelector<HTMLSelectElement>('#player2')!

const playButton = document.querySelector<HTMLSelectElement>('#play')!
const controls = document.querySelector<HTMLDivElement>('#controls')!
playButton.addEventListener('click', () => {
  controls.style.display = 'none'
  let player1 = selectPlayer1.value == 'human' ? new Player(new KeyboardInput()): new AIPlayer()
  let player2 = selectPlayer2.value == 'human' ? new Player(new KeyboardInput()): new AIPlayer()
  const game = new Game(gameCanvas, textCanvas, player1, player2)
  console.log(game)
  game.start()
})

playButton.click()