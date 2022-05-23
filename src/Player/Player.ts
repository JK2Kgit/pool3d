import {IPlayer} from "./IPlayer";
import {Transform} from "../GameObjects/Transform";
import {IInputMethod} from "./IInputMethod";
import {clamp, GameStage} from "../helpers/helpers";
import {V3, V3ClampLength, V3RotateOn2D, Vector3} from "../helpers/Vector3";
import {STRENGTH_MAX, STRENGTH_MIN} from "../helpers/Constants";

const STRENGTH_DIFF = STRENGTH_MAX - STRENGTH_MIN;

export class Player extends IPlayer{
  inputMethod: IInputMethod
  sensitivity: number = .8
  posSensitivity = .5
  strengthSensitivity: number = 1.6
  strength: number = STRENGTH_MIN + STRENGTH_DIFF/2
  ballPos: Vector3 = V3(0,0,0)
  lastStage: GameStage = GameStage.BallPlacement

  constructor(inputMethod: IInputMethod) {
    super();
    this.inputMethod = inputMethod
    this.registerHandlers()
  }

  handleInput(dt: number, stage: GameStage): {T: Transform, C: boolean, ball: Vector3} {
    this.lastStage = stage
    let C = false
    this.cameraTransformInv.rotation.y += (this.sensitivity * dt * this.inputMethod.getLeft())
    this.cameraTransformInv.rotation.y += (-this.sensitivity * dt * this.inputMethod.getRight())
    this.cameraTransformInv.rotation.x += (this.sensitivity * dt * this.inputMethod.getUp())
    this.cameraTransformInv.rotation.x += (-this.sensitivity * dt * this.inputMethod.getDown())
    this.cameraTransformInv.rotation.x = clamp(this.cameraTransformInv.rotation.x, Math.PI/ 12, Math.PI/4)

    if(stage == GameStage.BallPlacement){
      this.ballPos.x += (this.posSensitivity * dt * this.inputMethod.getUpModified())
      this.ballPos.x += (-this.posSensitivity * dt * this.inputMethod.getDownModified())
      this.ballPos.y += (this.posSensitivity * dt * this.inputMethod.getRightModified())
      this.ballPos.y += (-this.posSensitivity * dt * this.inputMethod.getLeftModified())
      this.ballPos.x = clamp(this.ballPos.x, -Infinity, 0)
      this.ballPos = V3ClampLength(this.ballPos, .5)

      return {T: this.cameraTransformInv, C: C, ball: this.ballPos}
    }

    if(stage == GameStage.Playing){
      this.strength += (this.strengthSensitivity * dt * this.inputMethod.getUpModified())
      this.strength += (-this.strengthSensitivity * dt * this.inputMethod.getDownModified())

      this.strength = clamp(this.strength, STRENGTH_MIN, STRENGTH_MAX)

      if(this.inputMethod.getLeft() || this.inputMethod.getRight() || this.inputMethod.getUp() || this.inputMethod.getDown())
        C = true
      if(this.inputMethod.getLeftModified() || this.inputMethod.getRightModified() || this.inputMethod.getUpModified() || this.inputMethod.getDownModified())
        C = true

    }

    return {T: this.cameraTransformInv, C: C, ball: this.ballPos}
  }

  registerHandlers(){
    this.inputMethod.setHitHandler(() => this.hitHandler())
  }

  hitHandler(){
    if(this.lastStage == GameStage.BallPlacement)
      this.placeCallback(this.ballPos)
    if(this.lastStage == GameStage.Playing){
      this.hitCallback({
        direction: V3RotateOn2D({x: 1, y: 0, z: 0}, this.cameraTransformInv.rotation.y),
        positionOnBall: {x: 0, y: 0},
        strength: this.strength
      })
    }
  }

  getStrength(): number {
    return (this.strength - STRENGTH_MIN)/STRENGTH_DIFF;
  }
}
