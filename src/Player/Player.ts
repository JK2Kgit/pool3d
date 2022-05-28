import {IPlayer} from "./IPlayer";
import {Transform} from "../GameObjects/Transform";
import {IInputMethod} from "./IInputMethod";
import {clamp, GameStage} from "../helpers/helpers";
import {V3ClampLength, V3RotateOn2D, Vector3} from "../helpers/Vector3";
import {STRENGTH_MAX, STRENGTH_MIN, STRIKE} from "../helpers/Constants";
import {V2, Vector2} from "../helpers/Vector2";

const STRENGTH_DIFF = STRENGTH_MAX - STRENGTH_MIN;
const CAMERA_MIN = Math.PI/ 12
const CAMERA_MAX = Math.PI/4
const CAMERA_DIFF = CAMERA_MAX - CAMERA_MIN
const STRIKE_DIFF = STRIKE.TOP - STRIKE.BOTTOM

export class Player extends IPlayer{
  inputMethod: IInputMethod
  sensitivity: number = .8
  posSensitivity = .5
  strengthSensitivity: number = 1.6
  strength: number = STRENGTH_MIN + STRENGTH_DIFF/2
  lastStage: GameStage = GameStage.BallPlacement
  hitPlace: Vector2 = V2(0,0)

  constructor(inputMethod: IInputMethod) {
    super();
    this.inputMethod = inputMethod
    this.registerHandlers()
  }

  handleInput(dt: number, stage: GameStage): {T: Transform, C: boolean, ballPos: Vector3, hitPlace: Vector2}{
    this.lastStage = stage
    let C = false
    this.cameraTransformInv.rotation.y += (this.sensitivity * dt * this.inputMethod.getLeft())
    this.cameraTransformInv.rotation.y += (-this.sensitivity * dt * this.inputMethod.getRight())
    this.cameraTransformInv.rotation.x += (this.sensitivity * dt * this.inputMethod.getUp())
    this.cameraTransformInv.rotation.x += (-this.sensitivity * dt * this.inputMethod.getDown())
    this.cameraTransformInv.rotation.x = clamp(this.cameraTransformInv.rotation.x, CAMERA_MIN, CAMERA_MAX)

    if(stage == GameStage.BallPlacement || stage == GameStage.BallRePlacement){
      this.ballPos.x += (this.posSensitivity * dt * this.inputMethod.getUpModified())
      this.ballPos.x += (-this.posSensitivity * dt * this.inputMethod.getDownModified())
      this.ballPos.y += (this.posSensitivity * dt * this.inputMethod.getRightModified())
      this.ballPos.y += (-this.posSensitivity * dt * this.inputMethod.getLeftModified())
      this.ballPos.x = clamp(this.ballPos.x, -Infinity, 0)
      this.ballPos = V3ClampLength(this.ballPos, .5)

      return {T: this.cameraTransformInv, C: C, ballPos: this.ballPos, hitPlace: this.hitPlace}
    }

    if(stage == GameStage.Playing){
      this.strength += (this.strengthSensitivity * dt * this.inputMethod.getUpModified())
      this.strength += (-this.strengthSensitivity * dt * this.inputMethod.getDownModified())

      this.strength = clamp(this.strength, STRENGTH_MIN, STRENGTH_MAX)

      const cameraPos = (this.cameraTransformInv.rotation.x - CAMERA_MIN)/ CAMERA_DIFF
      this.hitPlace.y = (1 - cameraPos)*STRIKE_DIFF + STRIKE.BOTTOM

      this.hitPlace.x += (this.sensitivity * dt * this.inputMethod.getRightModified())
      this.hitPlace.x += (-this.sensitivity * dt * this.inputMethod.getLeftModified())
      this.hitPlace.x = clamp(this.hitPlace.x, -STRIKE.SIDE, STRIKE.SIDE)


      if(this.inputMethod.getLeft() || this.inputMethod.getRight() || this.inputMethod.getUp() || this.inputMethod.getDown())
        C = true
      if(this.inputMethod.getLeftModified() || this.inputMethod.getRightModified() || this.inputMethod.getUpModified() || this.inputMethod.getDownModified())
        C = true

    }

    return {T: this.cameraTransformInv, C: C, ballPos: this.ballPos, hitPlace: this.hitPlace}
  }

  registerHandlers(){
    this.inputMethod.setHitHandler(() => this.hitHandler())
  }

  hitHandler(){
    if(!this.on)
      return

    if(this.lastStage == GameStage.BallPlacement || this.lastStage == GameStage.BallRePlacement)
      this.placeCallback(this.ballPos)
    if(this.lastStage == GameStage.Playing){
      this.hitCallback({
        direction: V3RotateOn2D({x: 1, y: 0, z: 0}, this.cameraTransformInv.rotation.y),
        angleRad: this.cameraTransformInv.rotation.x,
        positionOnBall: this.hitPlace,
        strength: this.strength
      })
    }
  }

  getStrength(): number {
    return (this.strength - STRENGTH_MIN)/STRENGTH_DIFF;
  }
}
