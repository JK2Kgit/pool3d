import {IPlayer} from "./IPlayer";
import {Transform} from "../GameObjects/Transform";
import {IInputMethod} from "./IInputMethod";
import {clamp} from "../helpers/helpers";

export class Player extends IPlayer{
  inputMethod: IInputMethod
  sensitivity: number = .8
  strength: number = 15

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
    let C = false
    if(this.inputMethod.getLeft() || this.inputMethod.getRight() || this.inputMethod.getUp() || this.inputMethod.getDown())
      C = true

    return {T: this.cameraTransformInv, C: C}
  }

  registerHitHandler(){
    this.inputMethod.setHitHandler(() => this.hitHandler())

  }

  hitHandler(){
    this.hitCallback({
      direction: {x: 1, y: .05, z: 0},
      positionOnBall: {x: 0, y: 0},
      strength: this.strength
    })
  }
}
