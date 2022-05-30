import {IPlayer} from "./Player/IPlayer";
import {Table} from "./GameObjects/Table";
import * as wh from "./helpers/helpers"
import {BallColor, clamp, GameStage, getStartingBalls, PlayerColors} from "./helpers/helpers"
import {Transform} from "./GameObjects/Transform";
import {SkyBox} from "./GameObjects/SkyBox";
import {Ball} from "./GameObjects/Ball";
import {V3, V3Add, V3TimeScalar, V3Val, Vector3} from "./helpers/Vector3";
import {Hit} from "./helpers/Hit";
import {Physics} from "./Physics/Physics";
import {COORDS, FLICKER, PHYSICS_SCALE, SIZE_MULT, UPS, WHITE_BALL_POS, WIDTH} from "./helpers/Constants";
import {V2, V2Angle, Vector2} from "./helpers/Vector2";


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
  cameraTransform: Transform = new Transform({x: 0, y: 0, z: 0}, {x: Math.PI / 7, y: 0, z: 0})
  relativeZoom: number = 5
  ballHitPosition: Vector2 = V2(0,0)
  physics: Physics
  wasCalculating: boolean = false
  change: boolean = true
  showStrength: boolean = false
  showCenter: boolean = false
  text1: string | undefined = undefined
  text2: string | undefined = undefined
  textBlack: string | undefined = undefined
  images: HTMLImageElement[];
  flicker: number = 0
  stage: GameStage = GameStage.BallPlacement
  ballInHoles: Ball[] = []
  firstHit: Ball | undefined = undefined
  audio :  HTMLAudioElement

  player1Color: PlayerColors = PlayerColors.Undefined
  canSwitchColor: boolean = false

  get player2Color(): PlayerColors {
    if (this.player1Color == PlayerColors.Undefined)
      return PlayerColors.Undefined
    return this.player1Color == PlayerColors.PlayerColor ? PlayerColors.PlayerGrid : PlayerColors.PlayerColor
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
    this.images = [new Image(50 * SIZE_MULT * .5, 45 * SIZE_MULT * .5), new Image(50 * SIZE_MULT * .5, 45 * SIZE_MULT * .5), new Image(50 * SIZE_MULT * .5, 45 * SIZE_MULT * .5)]
    this.images[0].src = "UIAssets/white.png"
    this.images[1].src = "UIAssets/clear.png"
    this.images[2].src = "UIAssets/dotted.png"
    this.audio = new Audio();
    this.audio.loop = false;
  }

  start() {
    this.lastFrame = Date.now()
    this.players[this.currentPlayer].on = true
    this.players.forEach(p =>{
      p.setTransform(this.cameraTransform)
      p.hitCallback = (hit: Hit) => this.handleHit(hit)
      p.placeCallback = (pos: Vector3) => this.handlePlace(pos)
      p.switchCallback = () => this.switchColor()
      p.referenceGame(this)
    })
    this.skyBox.draw(this.cameraTransform.rotation.x)
    this.text1 = "PLAYER ONE"
    if(this.players[this.currentPlayer].isAi()){
      this.text2 = "THINKING..."
      this.showCenter = false
      this.showStrength = false
    }
    else {
      this.textBlack = "PLACE THE BALL"
    }
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

    if(this.stage != GameStage.Ended)
      window.requestAnimationFrame(() => this.frame());
  }

  drawFps(fps: number) {
    this.textContext.fillStyle = 'white';
    this.textContext.fillRect(0, 46, 200, 60)
    this.textContext.font = '25px Arial';
    this.textContext.fillStyle = 'red';
    this.textContext.fillText("FPS: " + fps, 10, 75);
  }

  drawUi(_playerId: number, _playerOneColor: any) {
    this.flicker += 1
    const mult = WIDTH / 562
    const half = WIDTH / 2

    if(this.text1 != undefined){
      this.textContext.fillStyle = '#ffffff';
      this.textContext.fillRect(100*mult, 0, 124 * mult, 12 * mult)
      this.textContext.font = 12*mult + 'px c64Font';
      this.textContext.fillStyle = 'black';
      this.textContext.fillText(this.text1, 102*mult,  12*mult);
    }

    if(this.text2 != undefined){
      this.textContext.fillStyle = '#ffffff';
      this.textContext.fillRect(280*mult, 0, 134 * mult, 12 * mult)
      this.textContext.font = 12*mult + 'px c64Font';
      this.textContext.fillStyle = 'black';
      this.textContext.fillText(this.text2, 282*mult,  12*mult);
    }

    if(this.textBlack != undefined){
      this.textContext.fillStyle = '#000000';
      this.textContext.fillRect(280*mult, 0, 172 * mult, 12 * mult)
      this.textContext.font = 12*mult + 'px c64Font';
      this.textContext.fillStyle = 'white';
      this.textContext.fillText(this.textBlack, 282*mult,  12*mult);
    }

    if (this.showStrength) {
      const strength = this.players[this.currentPlayer].getStrength()

      this.textContext.fillStyle = '#000000';
      this.textContext.fillRect(half + 28 * mult, 0, 140 * mult, 14 * mult)

      this.textContext.fillStyle = '#ffffff';
      this.textContext.fillRect(half + 42 * mult, 3 * mult, 112 * mult, 8 * mult)

      this.textContext.fillStyle = '#588d43';
      this.textContext.fillRect(half + 31 * mult, 3 * mult, 8 * mult, 2 * mult)
      this.textContext.fillRect(half + 31 * mult, 9 * mult, 8 * mult, 2 * mult)

      this.textContext.fillRect(half + 157 * mult, 3 * mult, 8 * mult, 2 * mult)
      this.textContext.fillRect(half + 157 * mult, 9 * mult, 8 * mult, 2 * mult)


      this.textContext.fillStyle = '#69382b';
      this.textContext.fillRect(half + 42 * mult, 3 * mult, Math.round(strength * 112 * mult), 8 * mult)

      this.textContext.fillStyle = '#000000';
      this.textContext.fillRect(half + (41 + strength * 112) * mult, 0, 3 * mult, 14 * mult)

    }

    if (this.showCenter){
      this.textContext.fillStyle = '#588d43';
      this.textContext.fillRect(half - 12.5 * mult, 0, 25 * mult, 23 * mult)
      this.textContext.drawImage(this.images[0], half - 12.5 * mult, 0)
      const centerY = (1 - this.ballHitPosition.y)*mult*11.5
      const centerX = half + this.ballHitPosition.x*mult*10
      this.textContext.fillStyle = '#000000';
      this.textContext.fillRect(centerX - 5.25*mult, centerY - mult, 10.5*mult, 2*mult)
      this.textContext.fillRect(centerX - 1.75*mult, centerY - 2.5*mult, 3.5*mult, 5*mult)

    }

    if (this.player1Color != PlayerColors.Undefined) {
      try {
        this.textContext.drawImage(this.images[this.player1Color], 0, 0)
        this.textContext.drawImage(this.images[this.player2Color], WIDTH - 25 * mult, 0)
      } catch (e) {
        console.log(e)
      }

    }

    let coords = COORDS[this.player1Color == PlayerColors.Undefined ? 0 : 1][this.currentPlayer]
    this.textContext.fillStyle = '#588d43';
    if(!this.physics.isCalculating())
      this.textContext.fillRect(coords.x, coords.y, 25 * mult, 23 * mult)
    if (this.flicker > FLICKER / 2 && !this.physics.isCalculating())
      this.textContext.drawImage(this.images[0], coords.x, coords.y)


    if (this.flicker > FLICKER) {
      this.flicker = 0
    }
  }

  update(dt: number) {
    if (this.wasCalculating && !this.physics.isCalculating()) {
      this.handleMoveEnd()
    }
    this.wasCalculating = this.physics.isCalculating()

    if (!this.wasCalculating && !this.balls[0].moving) {
      this.centerPosition = V3TimeScalar(this.balls[0].position, PHYSICS_SCALE)
    }
    this.change = false

    if (!this.locked) {
      let res = this.players[this.currentPlayer].handleInput(dt, this.stage)
      this.cameraTransform = res.T
      this.change = res.C
      this.ballHitPosition = res.hitPlace
      if (this.stage == GameStage.BallPlacement || this.stage == GameStage.BallRePlacement) {
        this.balls[0].position = V3Add(WHITE_BALL_POS, res.ballPos)
      }
    }

    this.balls = this.physics.getPositionsNew()
    this.calculateCameraPosition()
    this.drawScene();
  }

  drawScene() {
    this.skyBox.draw(this.cameraTransform.rotation.x)
    this.table.draw(this.cameraTransform)
    this.balls.forEach((ball) => ball.draw(this.cameraTransform, this.table.position))

  }

  handleHole(ball: Ball) {
    this.ballInHoles.push(ball)
  }

  handleFirstHit(ball: Ball) {
    this.firstHit = ball
  }

  handleMoveEnd() {
    console.log(JSON.parse(JSON.stringify(this.ballInHoles)), this.firstHit?.clone())
    const holeWhite = this.ballInHoles.some((b) => b.type == BallColor.White)
    const holeBlack = this.ballInHoles.some((b) => b.type == BallColor.black)
    const holeDotted = this.ballInHoles.some((b) => b.type == BallColor.grid)
    const holeClear = this.ballInHoles.some((b) => b.type == BallColor.color)
    let faul = false
    let end = false

    if (this.player1Color == PlayerColors.Undefined) {
      if (this.firstHit == undefined) {
        faul = true
      }

      if (!holeClear && !holeDotted) { //none
        end = true
      }
      if (!holeClear && holeDotted) { // dotted
        if (this.currentPlayer == 0)
          this.player1Color = PlayerColors.PlayerGrid
        else
          this.player1Color = PlayerColors.PlayerColor
      }
      if (holeClear && !holeDotted) { // clear
        if (this.currentPlayer == 0)
          this.player1Color = PlayerColors.PlayerColor
        else
          this.player1Color = PlayerColors.PlayerGrid
      }
      if (holeClear && holeDotted) { // both
        this.player1Color = PlayerColors.PlayerColor
        this.canSwitchColor = true
      }
    } else {
      if (this.firstHit == undefined) {
        faul = true
      } else {
        if (this.currentPlayer == 0) {
          if (this.player1Color as number != this.firstHit?.type as number && this.firstHit.type != BallColor.black)
            faul = true

          if(this.player1Color == PlayerColors.PlayerColor){
            if(!holeClear)
              end = true
          } else {
            if(!holeDotted)
              end = true
          }

        } else {
          if (this.player2Color as number != this.firstHit?.type as number && this.firstHit.type != BallColor.black)
            faul = true

          if(this.player2Color == PlayerColors.PlayerColor){
            if(!holeClear)
              end = true
          } else {
            if(!holeDotted)
              end = true
          }
        }

      }
    }

    if(this.firstHit?.type == BallColor.black){
      const color = this.currentPlayer == 0 ? this.player1Color : this.player2Color
      const balls = this.balls.filter((b) => b.type as number == color as number && b.position.z == 0)
      if(balls.length != 0)
        faul = true
    }

    if (holeBlack)
      this.gameOver()

    if (holeWhite)
      faul = true

    if(faul)
      end = true


    this.ballInHoles = []
    this.firstHit = undefined

    if(end)
      this.switchPlayer(faul)
  }

  switchPlayer(faul: boolean) {
    if (faul) {
      this.table.showSetup = true
      this.balls[0].moving = true
      this.balls[0].position = WHITE_BALL_POS
      this.physics.balls[0].position = WHITE_BALL_POS
      this.physics.history.balls[0][0].position = WHITE_BALL_POS
      this.physics.history.balls[0][0].moving = true
      this.players[this.currentPlayer].ballPos = V3(0, 0, 0)
      this.stage = GameStage.BallRePlacement
      this.centerPosition = this.balls[0].position
      this.showStrength = false
      this.showCenter = false
      this.textBlack = "PLACE THE BALL"
    }
    this.players[this.currentPlayer].on = false
    this.currentPlayer = this.currentPlayer == 0 ? 1 : 0
    this.players[this.currentPlayer].on = true
    this.text1 = this.currentPlayer == 0 ? "PLAYER ONE": "PLAYER TWO"
    this.canSwitchColor = false

    if(this.players[this.currentPlayer].isAi()){
      console.log("NOW AI")
      this.text2 = "THINKING..."
      this.showCenter = false
      this.showStrength = false
    }
    else {
      this.text2 = undefined
      this.showCenter = !faul
      this.showStrength = !faul
    }
  }

  gameOver() {
    this.stage = GameStage.Ended
    //this.canvas.style.display = 'none'
    console.log("GAME OVER", this)
  }

  playSound(name: string){
    this.audio.src = 'UIAssets/' + name
    this.audio.load()
    setTimeout(() => {
      this.audio.play()
        .then(() => {})
        .catch(() => this.audio.play());
    }, 50)

  }

  private calculateCameraPosition() {
    const phi = this.cameraTransform.rotation.y
    const dist = Game.distHorizontalToEdge(phi, this.centerPosition)
    //let distHorizontal = Game.distHorizontalToEdge(this.cameraTransform.rotation, this.centerPosition)
    this.cameraTransform.position = V3TimeScalar(this.centerPosition, -1)

    this.table.position.x = Game.distVertical(this.cameraTransform.rotation, dist) + this.relativeZoom
    // TODO: move table back and forth
  }

  private static distHorizontalToEdge(phi: number, point: Vector3): number {
    if(phi == 0.0)
      phi += Number.EPSILON
    phi = phi % (Math.PI * 2)
    if(phi < 0)
      phi = Math.PI*2 + phi
    let alpha

    let yNew, xDist, yDist, dist
    if (phi <= Math.PI * .5) {
      xDist = 5 + point.x
      alpha = Math.PI/2 - phi
      yNew = xDist / Math.tan(alpha)
      yDist = 5 + point.y
    } else if (phi <= Math.PI) {
      xDist = 5 - point.x
      alpha = phi - Math.PI/2
      yNew = Math.tan(Math.PI/2 - alpha) * xDist
      yDist = 5 + point.y
    } else if (phi <= Math.PI * 1.5) {
      xDist = 5 - point.x
      alpha = Math.PI*1.5 - phi
      yNew = Math.tan(Math.PI/2 - alpha) * xDist
      yDist = 5 - point.y
    } else {
      xDist = 5 + point.x
      alpha = Math.PI*1.5 - phi
      yNew = xDist / Math.tan(alpha)
      yDist = 5 - point.y
    }
    if (yNew < yDist) { // hits short edge
      dist = Math.abs(xDist / Math.sin(alpha))
    } else { //long edge
      dist = Math.abs(yDist / Math.cos(alpha))
    }
    //console.log(dist, xDist, yDist, yNew, phi, long)
    return clamp(dist, 0, xDist > yDist ? xDist : yDist)
  }

  private static distVertical(rotation: Vector3, distHorizontal: number) {
    return distHorizontal / Math.cos(rotation.x)
  }

  private handleHit(hit: Hit) {
    this.canSwitchColor = false
    this.playSound("strike.mp3")
    this.physics.hit(hit)
    this.text2 = undefined
  }

  private handlePlace(pos: Vector3) {
    this.stage = GameStage.Playing
    this.showStrength = !this.players[this.currentPlayer].isAi()
    this.showCenter = !this.players[this.currentPlayer].isAi()
    this.table.showSetup = false
    this.balls[0].moving = false
    this.balls[0].position = V3Add(WHITE_BALL_POS, pos)
    this.textBlack = undefined
  }

  private switchColor(){
    if(this.canSwitchColor)
      this.player1Color = this.player2Color
  }


}
