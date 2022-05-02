import {IPlayer} from "./IPlayer";
import {Transform} from "../Transform";
import {IInputMethod} from "./IInputMethod";
import {clamp} from "../helpers/helpers";

export class Player extends IPlayer{
  inputMethod: IInputMethod
  sensitivity: number = 1

  constructor(inputMethod: IInputMethod) {
    super();
    this.inputMethod = inputMethod
  }

  handleInput(dt: number): Transform {
    this.cameraTransformInv.rotation.y += (this.sensitivity * dt * this.inputMethod.getLeft())
    this.cameraTransformInv.rotation.y += (-this.sensitivity * dt * this.inputMethod.getRight())
    this.cameraTransformInv.rotation.x += (this.sensitivity * dt * this.inputMethod.getUp())
    this.cameraTransformInv.rotation.x += (-this.sensitivity * dt * this.inputMethod.getDown())
    this.cameraTransformInv.rotation.x = clamp(this.cameraTransformInv.rotation.x, 0, Math.PI/4)

    return this.cameraTransformInv
  }
}
