import {IPlayer} from "./IPlayer";
import {Transform} from "../GameObjects/Transform";
import {GameStage} from "../helpers/helpers";
import {V3, Vector3} from "../helpers/Vector3";

export class AIPlayer extends IPlayer{
  handleInput(_dt: number, _stage:GameStage): {T: Transform, C: boolean, ball:Vector3} {
    return {T: this.cameraTransformInv, C: false, ball: V3(0,0,0)}
  }

  getStrength(): number {
    return .5;
  }
}
