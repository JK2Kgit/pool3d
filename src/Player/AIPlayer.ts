import {IPlayer} from "./IPlayer";
import {Transform} from "../GameObjects/Transform";

export class AIPlayer extends IPlayer{
  handleInput(_dt: number): {T: Transform, C: boolean} {
    return {T: this.cameraTransformInv, C: false}
  }

  getStrength(): number {
    return -1;
  }
}
