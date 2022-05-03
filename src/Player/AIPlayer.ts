import {IPlayer} from "./IPlayer";
import {Transform} from "../GameObjects/Transform";

export class AIPlayer extends IPlayer{
  handleInput(_dt: number): Transform {
    return this.cameraTransformInv
  }
}
