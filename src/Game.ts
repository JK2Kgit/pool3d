import {IPlayer} from "./Player/IPlayer";
import {Table} from "./GameObjects/Table";
import * as wh from "./helpers/helpers"
import {Transform} from "./GameObjects/Transform";
import {SkyBox} from "./GameObjects/SkyBox";
import {Ball} from "./GameObjects/Ball";
import {Vector3, Vector3TimeScalar} from "./helpers/Vector3";
import {getStartingBalls} from "./helpers/helpers";
import {Hit} from "./helpers/Hit";

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
  balls: Ball[] = []
  whiteBall: Ball
  programInfo: any
  cameraTransform: Transform =  new Transform({x: 0, y: 0, z: 0}, {x: Math.PI/5.7, y: 0, z: 0})

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
    const balls = getStartingBalls(this.gl, this.programInfo)
    this.skyBox = new SkyBox(this.gl, this.programInfo)
    this.whiteBall = balls[0]
    this.balls = balls
  }

  start() {
    this.lastFrame = Date.now()
    this.players[this.currentPlayer].setTransform(this.cameraTransform)
    this.players.forEach(p => p.hitCallback = this.handleHit)
    window.requestAnimationFrame(() => this.frame());
  }

  frame() {
    const dt = (Date.now() - this.lastFrame) / 1000
    this.lastFrame = Date.now()
    const fps = Math.round(1 / dt);
    this.drawFps(fps)
    this.update(dt)
    window.requestAnimationFrame(() => this.frame());
  }

  drawFps(fps: number) {
    this.textContext.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
    this.textContext.font = '25px Arial';
    this.textContext.fillStyle = 'red';
    this.textContext.fillText("FPS: " + fps, 10, 30);
  }

  update(dt: number) {

    if(!this.locked){
      this.cameraTransform = this.players[this.currentPlayer].handleInput(dt)
    }
    this.calculateCameraPosition()
    this.drawScene();

  }

  drawScene() {
    this.skyBox.draw(this.cameraTransform.rotation.x)
    this.table.draw(this.cameraTransform)
    this.balls.forEach((ball) => ball.draw(this.cameraTransform, this.table.position))

  }

  private calculateCameraPosition() {
    let distHorizontal = this.distHorizontalToEdge(this.cameraTransform.rotation, this.whiteBall.position)
    this.cameraTransform.position = Vector3TimeScalar(this.whiteBall.position, -1)
    this.table.position.z = - this.distVertical(this.cameraTransform.rotation, distHorizontal) - 4
    this.table.position.y = this.heightTable(this.cameraTransform.rotation)
    // TODO: move table back and forth
  }

  private distHorizontalToEdge(rotation: Vector3, point: Vector3): number{
    let phi = Math.abs(rotation.y) + Number.EPSILON
    phi = phi % (Math.PI*2)

    let alpha = 0

    let yNew = 0
    let xDist = 0
    let yDist = 0
    let dist = 0
    if(phi <= Math.PI*.5 && phi > 0){
      xDist = 5 - point.x
      alpha = phi
      yNew = xDist / Math.tan(alpha)
      yDist = 5 - point.z
    } else if (phi <= Math.PI && phi > 0){
      xDist = 5 - point.x
      alpha = Math.PI - phi
      yNew = xDist / Math.tan(alpha)
      yDist = point.z + 5
    } else if (phi <= Math.PI*1.5 && phi > 0){
      xDist = point.x + 5
      alpha = phi
      yNew = xDist / Math.tan(alpha)
      yDist = point.z + 5
    } else {
      xDist = point.x + 5
      alpha = Math.PI*2 - phi
      yNew = xDist / Math.tan(alpha)
      yDist = 5 - point.z
    }
    if (yNew > yDist){ // hist short edge
      dist = Math.abs(yDist / Math.cos(alpha))
    } else { //long edge
      dist = Math.abs(xDist / Math.sin(alpha))
    }
    return dist
  }

  private distVertical(rotation: Vector3, distHorizontal: number){
    return distHorizontal / Math.cos(rotation.x)
  }

  private heightTable(rotation: Vector3){
    let phi = Math.abs(rotation.y/2) + Number.EPSILON
    return Math.sin(phi)
  }

  private handleHit(_hit: Hit){

  }
}
/*

    let phi = rotation.y + Math.PI/2
    let c = Math.cos(phi)
    let s  = Math.sin(phi)
    let x,y = 0
    if(TABLE_WIDTH*Math.abs(s) < TABLE_HEIGHT * Math.abs(c)){
      x = Math.sign(c) * TABLE_WIDTH / 2
      y = Math.tan(phi) * x
    }else {
      y = Math.sign(s) * TABLE_HEIGHT / 2
      x = (Math.cos(phi)/Math.sin(phi)) * y
    }
* */