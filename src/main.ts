import './style.css'
import {Game} from "./Game";
import {Player} from "./Player";
import {AIPlayer} from "./AIPlayer";

const gameCanvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')!
const textCanvas = document.querySelector<HTMLCanvasElement>('#textCanvas')!

const game = new Game(gameCanvas, textCanvas, new AIPlayer(), new Player())
game.start()
