import {IPlayer} from "./IPlayer";
import {Transform} from "../GameObjects/Transform";
import {IInputMethod} from "./IInputMethod";
import {clamp} from "../helpers/helpers";
import {V3RotateOn2D} from "../helpers/Vector3";
import {STRENGTH_MAX, STRENGTH_MIN} from "../helpers/Constants";

const STRENGTH_DIFF = STRENGTH_MAX - STRENGTH_MIN;

export class Player extends IPlayer{
  inputMethod: IInputMethod
  sensitivity: number = .8
  strengthSensitivity: number = 1.6
  strength: number = STRENGTH_MIN + STRENGTH_DIFF/2

  constructor(inputMethod: IInputMethod) {
    super();
    this.inputMethod = inputMethod
    this.registerHitHandler()
  }

  handleInput(dt: number): {T: Transform, C: boolean} {
    this.cameraTransformInv.rotation.y += (this.sensitivity * dt * this.inputMethod.getLeft())
    this.cameraTransformInv.rotation.y += (-this.sensitivity * dt * this.inputMethod.getRight())
    this.cameraTransformInv.rotation.x += (this.sensitivity * dt * this.inputMethod.getUp())
    this.cameraTransformInv.rotation.x += (-this.sensitivity * dt * this.inputMethod.getDown())
    this.cameraTransformInv.rotation.x = clamp(this.cameraTransformInv.rotation.x, Math.PI/ 12, Math.PI/4)

    this.strength += (this.strengthSensitivity * dt * this.inputMethod.getUpModified())
    this.strength += (-this.strengthSensitivity * dt * this.inputMethod.getDownModified())

    this.strength = clamp(this.strength, STRENGTH_MIN, STRENGTH_MAX)

    let C = false
    if(this.inputMethod.getLeft() || this.inputMethod.getRight() || this.inputMethod.getUp() || this.inputMethod.getDown())
      C = true
    if(this.inputMethod.getLeftModified() || this.inputMethod.getRightModified() || this.inputMethod.getUpModified() || this.inputMethod.getDownModified())
      C = true

    return {T: this.cameraTransformInv, C: C}
  }

  registerHitHandler(){
    this.inputMethod.setHitHandler(() => this.hitHandler())

  }

  hitHandler(){
    this.hitCallback({
      direction: V3RotateOn2D({x: 1, y: 0, z: 0}, this.cameraTransformInv.rotation.y),
      positionOnBall: {x: 0, y: 0},
      strength: this.strength
    })
  }

  getStrength(): number {
    return (this.strength - STRENGTH_MIN)/STRENGTH_DIFF;
  }
}
