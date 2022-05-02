import './style.css'
import {Game} from "./Game";
import {Player} from "./Player/Player";
import {AIPlayer} from "./Player/AIPlayer";
import {KeyboardInput} from "./Player/KeyboardInput";

const gameCanvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')!
const textCanvas = document.querySelector<HTMLCanvasElement>('#textCanvas')!

const game = new Game(gameCanvas, textCanvas, new Player(new KeyboardInput()), new AIPlayer())
console.log(game)
game.start()
