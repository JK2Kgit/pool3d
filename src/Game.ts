import {IPlayer} from "./Player/IPlayer";
import {Table} from "./GameObjects/Table";
import * as wh from "./helpers/helpers"
import {Transform} from "./GameObjects/Transform";
import {SkyBox} from "./GameObjects/SkyBox";
import {Ball} from "./GameObjects/Ball";
import {Vector3, V3TimeScalar} from "./helpers/Vector3";
import {getStartingBalls} from "./helpers/helpers";
import {Hit} from "./helpers/Hit";
import {Physics} from "./Physics/Physics";
import {PHYSICS_SCALE, UPS, WIDTH} from "./helpers/Constants";

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
  centerPosition: Vector3
  programInfo: any
  cameraTransform: Transform =  new Transform({x: 0, y: 0, z: 0}, {x: Math.PI/5.7, y: 0, z: 0})
  physics: Physics
  change: boolean = true
  physicsMultiplayer: number = 5

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
    this.balls = balls
    this.centerPosition = this.balls[0].position
    this.physics = new Physics(this.balls, UPS)
  }

  start() {
    this.lastFrame = Date.now()
    this.players[this.currentPlayer].setTransform(this.cameraTransform)
    this.players.forEach(p => p.hitCallback = (hit: Hit) => this.handleHit(hit) )
    this.skyBox.draw(this.cameraTransform.rotation.x)
    window.requestAnimationFrame(() => this.frame());
    //setInterval(() => {this.physics.physicsLoop()}, 10)
  }

  frame() {
    // DT
    const time = Date.now()
    const dt = (time - this.lastFrame) / 1000
    this.lastFrame = Date.now()
    const fps = Math.round(1 / dt);

    // TextCanvas
    this.textContext.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
    this.drawUi(this.currentPlayer, null)
    this.drawFps(fps)

    // Game Canvas
    this.update(dt)
    window.requestAnimationFrame(() => this.frame());
  }

  drawFps(fps: number) {
    this.textContext.fillStyle = 'white';
    this.textContext.fillRect(0, 0, 200, 60)
    this.textContext.font = '25px Arial';
    this.textContext.fillStyle = 'red';
    this.textContext.fillText("FPS: " + fps, 10, 30);
  }

  drawUi(_playerId: number, _playerOneColor: any){
    const mult = WIDTH / 562
    const half = WIDTH / 2
    this.textContext.fillStyle = '#588d43';
    this.textContext.fillRect(half - 14*mult, 0, 28*mult, 26*mult)



  }

  update(dt: number) {
    if(!this.physics.isCalculating()){
      this.centerPosition = V3TimeScalar(this.balls[0].position, PHYSICS_SCALE)
    }
    this.balls = this.physics.getPositionsNew()
    this.calculateCameraPosition()
    this.drawScene();
    this.change = false

    if(!this.locked){
      let res = this.players[this.currentPlayer].handleInput(dt)
      this.cameraTransform = res.T
      this.change = res.C
    }
  }

  drawScene() {
    this.skyBox.draw(this.cameraTransform.rotation.x)
    this.table.draw(this.cameraTransform)
    this.balls.forEach((ball) => ball.draw(this.cameraTransform, this.table.position))

  }

  private calculateCameraPosition() {
    let distHorizontal = Game.distHorizontalToEdge(this.cameraTransform.rotation, this.centerPosition)
    this.cameraTransform.position = V3TimeScalar(this.centerPosition, -1)
    this.table.position.x = Game.distVertical(this.cameraTransform.rotation, distHorizontal) + 4
    this.table.position.z = Game.heightTable(this.cameraTransform.rotation)
    // TODO: move table back and forth
  }

  private static distHorizontalToEdge(rotation: Vector3, point: Vector3): number{
    let phi = Math.abs(rotation.y) + Number.EPSILON
    phi = phi % (Math.PI*2)
    let alpha

    let yNew, xDist, yDist, dist
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

  private static distVertical(rotation: Vector3, distHorizontal: number){
    return distHorizontal / Math.cos(rotation.x)
  }

  private static heightTable(rotation: Vector3){
    let phi = Math.abs(rotation.y/2) + Number.EPSILON
    return Math.sin(phi)
  }

  private handleHit(hit: Hit){
    this.physics.hit(hit)
  }
}