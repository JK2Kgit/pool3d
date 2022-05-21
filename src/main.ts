import './style.css'
import {Game} from "./Game";
import {Player} from "./Player/Player";
import {AIPlayer} from "./Player/AIPlayer";
import {KeyboardInput} from "./Player/KeyboardInput";
import {HEIGHT, WIDTH} from "./helpers/Constants";
import {allRoots} from "flo-poly";

const gameCanvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')!
const textCanvas = document.querySelector<HTMLCanvasElement>('#textCanvas')!
gameCanvas.width = WIDTH
gameCanvas.height = HEIGHT
textCanvas.width = WIDTH
textCanvas.height = HEIGHT

const game = new Game(gameCanvas, textCanvas, new Player(new KeyboardInput()), new AIPlayer())
console.log(game)
console.log(allRoots)
game.start()
