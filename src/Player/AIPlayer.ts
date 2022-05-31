import {IPlayer} from "./IPlayer";
import {Transform} from "../GameObjects/Transform";
import {BallColor, clamp, GameStage, PlayerColors} from "../helpers/helpers";
import {V3, V3ClampLength, V3RotateOn2D, V3Sub, V3ToUnit, V3Val, Vector3} from "../helpers/Vector3";
import {V2, Vector2} from "../helpers/Vector2";
import {Hit} from "../helpers/Hit";
import {Ball} from "../GameObjects/Ball";
import {CAMERA_MAX, CAMERA_MIN, STRENGTH_MAX, STRENGTH_MIN, STRIKE, ZOOM_MAX, ZOOM_MIN} from "../helpers/Constants";

const CAMERA_DIFF = CAMERA_MAX - CAMERA_MIN
const STRIKE_DIFF = STRIKE.TOP - STRIKE.BOTTOM
const DEFAULT_ZOOM =( ZOOM_MIN + ZOOM_MAX)/2

export class AIPlayer extends IPlayer{
  isCalculating = false
  isPlacing = false
  handleInput(_dt: number, stage:GameStage): {T: Transform, C: boolean, ballPos: Vector3, hitPlace: Vector2, Zoom: number} {
    if(!this.isCalculating && stage == GameStage.Playing && this.on) {
      setTimeout(() => this.calculateHit(), 0)
      this.isCalculating = true
    }
    if(!this.isPlacing && (stage == GameStage.BallPlacement || stage == GameStage.BallRePlacement)) {
      setTimeout(() => this.placeBall(), 1000)
      this.isPlacing = true
    }
    return {T: this.cameraTransformInv, C: false, ballPos: V3(0,0,0), hitPlace: V2(0,0), Zoom: DEFAULT_ZOOM}
  }

  calculateHit(){
    if(this.game == undefined)
      throw Error("GAME is undefined")
    let color = this.game.currentPlayer == 0 ? this.game.player1Color : this.game.player2Color
    if(color == PlayerColors.Undefined)
      color = Math.random() > .5 ? PlayerColors.PlayerColor: PlayerColors.PlayerGrid
    const balls = this.game.balls.filter((b) => b.type as number == color as number && b.position.z == 0)
    let target: Ball | undefined
    if(balls.length == 0)
      target = this.game.balls.filter((b) => b.type == BallColor.black)[0]
    else
      target = balls[Math.floor(Math.random() * balls.length)];

    const white = this.game.balls[0]
    let direction = V3Sub(target.position, white.position)
    const phi = Math.PI *(Math.random() - .5) * .075
    direction = V3RotateOn2D(direction, phi)
    let str = V3Val(direction)*Math.random()*1.75 + 3.5
    if(this.game.stage == GameStage.BallPlacement || this.game.stage == GameStage.BallRePlacement)
      str += 3


    const angle = CAMERA_MIN + CAMERA_DIFF*Math.random()

    const cameraPos = (angle - CAMERA_MIN)/ CAMERA_DIFF
    const posY = (1 - cameraPos)*STRIKE_DIFF + STRIKE.BOTTOM

    const posX = (Math.random()*2  - 1) * STRIKE.SIDE

    setTimeout(() => {
      this.hit({
        angleRad: angle,
        direction: V3ToUnit(direction),
        positionOnBall: V2(posX,posY),
        strength: clamp(str, STRENGTH_MIN, STRENGTH_MAX+1)
      })
    }, 3000*Math.random())
  }

  placeBall(){
    this.ballPos.x = Math.random() * 2 - 1
    this.ballPos.y = Math.random() * 2 - 1
    this.ballPos.x = clamp(this.ballPos.x, -Infinity, 0)
    this.ballPos = V3ClampLength(this.ballPos, .5)

    this.placeCallback(this.ballPos)
    this.isPlacing = false
  }

  hit(hit: Hit){
    this.isCalculating = false
    if(this.on)
      this.hitCallback(hit)
  }

  getStrength(): number {
    return .5;
  }

  isAi(): boolean {
    return true;
  }
}
