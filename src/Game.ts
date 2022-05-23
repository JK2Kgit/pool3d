import {IPlayer} from "./Player/IPlayer";
import {Table} from "./GameObjects/Table";
import * as wh from "./helpers/helpers"
import {GameStage, getStartingBalls, PlayerColors} from "./helpers/helpers"
import {Transform} from "./GameObjects/Transform";
import {SkyBox} from "./GameObjects/SkyBox";
import {Ball} from "./GameObjects/Ball";
import {V3Add, V3TimeScalar, Vector3} from "./helpers/Vector3";
import {Hit} from "./helpers/Hit";
import {Physics} from "./Physics/Physics";
import {COORDS, FLICKER, PHYSICS_SCALE, SIZE_MULT, UPS, WHITE_BALL_POS, WIDTH} from "./helpers/Constants";


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
  wasCalculating: boolean = false
  change: boolean = true
  showStrength: boolean = true
  images: HTMLImageElement[];
  flicker: number = 0
  stage: GameStage = GameStage.BallPlacement
  ballInHoles: Ball[] = []
  firstHit: Ball | undefined = undefined

  player1Color: PlayerColors = PlayerColors.Undefined
  get player2Color(): PlayerColors {
    if(this.player1Color == PlayerColors.Undefined)
      return PlayerColors.Undefined
    return this.player1Color == PlayerColors.PlayerClear ? PlayerColors.PlayerDotted : PlayerColors.PlayerClear
  }

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
    this.balls[0].moving = true
    this.physics = new Physics(this.balls, UPS, this)
    this.images = [new Image(50*SIZE_MULT*.5, 45*SIZE_MULT*.5), new Image(50*SIZE_MULT*.5, 45*SIZE_MULT*.5), new Image(50*SIZE_MULT*.5, 45*SIZE_MULT*.5)]
    this.images[0].src = "UIAssets/white.png"
    this.images[1].src = "UIAssets/clear.png"
    this.images[2].src = "UIAssets/dotted.png"
  }

  start() {
    this.lastFrame = Date.now()
    this.players[this.currentPlayer].setTransform(this.cameraTransform)
    this.players.forEach(p => p.hitCallback = (hit: Hit) => this.handleHit(hit) )
    this.players.forEach(p => p.placeCallback = (pos: Vector3) => this.handlePlace(pos) )
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

    // Game Canvas
    this.update(dt)

    // TextCanvas
    this.textContext.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
    this.drawUi(this.currentPlayer, null)
    this.drawFps(fps)

    window.requestAnimationFrame(() => this.frame());
  }

  drawFps(fps: number) {
    this.textContext.fillStyle = 'white';
    this.textContext.fillRect(0, 45, 200, 60)
    this.textContext.font = '25px Arial';
    this.textContext.fillStyle = 'red';
    this.textContext.fillText("FPS: " + fps, 10, 75);
  }

  drawUi(_playerId: number, _playerOneColor: any){
    this.flicker += 1
    const mult = WIDTH / 562
    const half = WIDTH / 2
    this.textContext.fillStyle = '#588d43';
    this.textContext.fillRect(half - 11*mult, 0, 25*mult, 22.5*mult)

    if(this.showStrength){
      const strength = this.players[this.currentPlayer].getStrength()

      this.textContext.fillStyle = '#000000';
      this.textContext.fillRect(half + 28*mult, 0, 140*mult, 14*mult)

      this.textContext.fillStyle = '#ffffff';
      this.textContext.fillRect(half + 42*mult, 3*mult, 112*mult, 8*mult)

      this.textContext.fillStyle = '#588d43';
      this.textContext.fillRect(half + 31*mult, 3*mult, 8*mult, 2*mult)
      this.textContext.fillRect(half + 31*mult, 9*mult, 8*mult, 2*mult)

      this.textContext.fillRect(half + 157*mult, 3*mult, 8*mult, 2*mult)
      this.textContext.fillRect(half + 157*mult, 9*mult, 8*mult, 2*mult)


      this.textContext.fillStyle = '#69382b';
      this.textContext.fillRect(half + 42*mult, 3*mult,  Math.round(strength*112*mult), 8*mult)

      this.textContext.fillStyle = '#000000';
      this.textContext.fillRect(half + (41+strength*112)*mult, 0, 3*mult, 14*mult)

    }

    if(this.player1Color != PlayerColors.Undefined){
      try{
        this.textContext.drawImage(this.images[this.player1Color], 0, 0)
        this.textContext.drawImage(this.images[this.player2Color], WIDTH - 25*mult, 0)
      }catch (e){
        console.log(e)
      }

    }

    let coords = COORDS[this.player1Color == PlayerColors.Undefined ? 0 : 1][this.currentPlayer]
    this.textContext.fillStyle = '#588d43';
    this.textContext.fillRect(coords.x, coords.y, 25*mult, 22.5*mult)
    if(this.flicker > FLICKER / 2)
      this.textContext.drawImage(this.images[0], coords.x, coords.y)



    if(this.flicker > FLICKER){
      this.flicker = 0
    }
  }

  update(dt: number) {
    if(this.wasCalculating && !this.physics.isCalculating()){
      this.handleMoveEnd()
    }
    this.wasCalculating = this.physics.isCalculating()

    if(!this.wasCalculating && !this.balls[0].moving){
      this.centerPosition = V3TimeScalar(this.balls[0].position, PHYSICS_SCALE)
    }
    this.balls = this.physics.getPositionsNew()
    this.calculateCameraPosition()
    this.drawScene();
    this.change = false

    if(!this.locked){
      let res = this.players[this.currentPlayer].handleInput(dt, this.stage)
      this.cameraTransform = res.T
      this.change = res.C
      if(this.stage == GameStage.BallPlacement)
        this.balls[0].position = V3Add(WHITE_BALL_POS, res.ball)
    }
  }

  drawScene() {
    this.skyBox.draw(this.cameraTransform.rotation.x)
    this.table.draw(this.cameraTransform)
    this.balls.forEach((ball) => ball.draw(this.cameraTransform, this.table.position))

  }

  handleHole(ball: Ball){
    this.ballInHoles.push(ball)
  }

  handleFirstHit(ball: Ball){
    this.firstHit = ball
  }

  handleMoveEnd(){
    console.log(this.ballInHoles, this.firstHit)


    this.ballInHoles = []
    this.firstHit = undefined
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
  private handlePlace(pos: Vector3){
    this.stage = GameStage.Playing
    this.table.showSetup = false
    this.balls[0].moving = false
    this.balls[0].position = V3Add(WHITE_BALL_POS, pos)
  }
}
