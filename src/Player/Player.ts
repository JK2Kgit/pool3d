import {IPlayer} from "./IPlayer";
import {Transform} from "../GameObjects/Transform";
import {IInputMethod} from "./IInputMethod";
import {clamp} from "../helpers/helpers";

export class Player extends IPlayer{
  inputMethod: IInputMethod
  sensitivity: number = .8
  strength: number = 1

  constructor(inputMethod: IInputMethod) {
    super();
    this.inputMethod = inputMethod
    this.registerHitHandler()
  }

  handleInput(dt: number): Transform {
    this.cameraTransformInv.rotation.y += (this.sensitivity * dt * this.inputMethod.getLeft())
    this.cameraTransformInv.rotation.y += (-this.sensitivity * dt * this.inputMethod.getRight())
    this.cameraTransformInv.rotation.x += (this.sensitivity * dt * this.inputMethod.getUp())
    this.cameraTransformInv.rotation.x += (-this.sensitivity * dt * this.inputMethod.getDown())
    this.cameraTransformInv.rotation.x = clamp(this.cameraTransformInv.rotation.x, Math.PI/ 12, Math.PI/4)

    return this.cameraTransformInv
  }

  registerHitHandler(){
    this.inputMethod.setHitHandler(() => this.hitHandler())

  }

  hitHandler(){
    this.hitCallback({
      direction: {x: 0, y: 0, z: -1.1},
      positionOnBall: {x: 0, y: 0},
      strength: this.strength
    })
  }
}
