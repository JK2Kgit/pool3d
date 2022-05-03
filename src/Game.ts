import {IPlayer} from "./Player/IPlayer";
import {Table} from "./GameObjects/Table";
import * as wh from "./helpers/helpers"
import {Transform} from "./GameObjects/Transform";
import {SkyBox} from "./GameObjects/SkyBox";

export class Game {
  canvas: HTMLCanvasElement
  gl: WebGL2RenderingContext
  textCanvas: HTMLCanvasElement
  textContext: CanvasRenderingContext2D
  players: IPlayer[]
  lastFrame: number
  frameCounter: number
  currentPlayer: number
  locked: boolean
  table: Table
  skyBox: SkyBox
  programInfo: any
  cameraTransform: Transform =  new Transform({x: 0, y: -1.3, z: 9}, {x: Math.PI/5.7, y: 0, z: 0})

  constructor(canvas: HTMLCanvasElement, textCanvas: HTMLCanvasElement, player0: IPlayer, player1: IPlayer) {
    this.canvas = canvas
    this.textCanvas = textCanvas
    this.players = [player0, player1]
    this.gl = canvas.getContext('webgl2', {antialias: false})!;
    this.textContext = textCanvas.getContext('2d')!;
    this.lastFrame = Date.now()
    this.frameCounter = 0
    this.currentPlayer = 0
    this.locked = false
    this.programInfo = wh.createProgramInfo(this.gl, ["vs", "fs"])
    this.table = new Table(this.gl, this.programInfo)
    this.skyBox = new SkyBox(this.gl, this.programInfo)
  }

  start() {
    this.lastFrame = Date.now()
    this.players[this.currentPlayer].setTransform(this.cameraTransform)
    window.requestAnimationFrame(() => this.frame());
  }

  frame() {
    const dt = (Date.now() - this.lastFrame) / 1000
    this.lastFrame = Date.now()
    const fps = Math.round(1 / dt);
    this.textContext.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
    this.drawFps(fps)
    this.update(dt)
    window.requestAnimationFrame(() => this.frame());
  }

  drawFps(fps: number) {
    this.textContext.font = '25px Arial';
    this.textContext.fillStyle = 'red';
    this.textContext.fillText("FPS: " + fps, 10, 30);
  }

  update(dt: number) {

    if(!this.locked){
      this.cameraTransform = this.players[this.currentPlayer].handleInput(dt)
    }
    this.drawScene();

  }

  drawScene() {
    this.skyBox.draw(this.cameraTransform.rotation.x)
    this.table.draw(this.cameraTransform)

  }
}