import {IPlayer} from "./IPlayer";
import {Transform} from "../GameObjects/Transform";
import {GameStage} from "../helpers/helpers";
import {V3, Vector3} from "../helpers/Vector3";
import {V2, Vector2} from "../helpers/Vector2";

export class AIPlayer extends IPlayer{
  handleInput(_dt: number, _stage:GameStage): {T: Transform, C: boolean, ballPos: Vector3, hitPlace: Vector2} {
    return {T: this.cameraTransformInv, C: false, ballPos: V3(0,0,0), hitPlace: V2(0,0)}
  }

  getStrength(): number {
    return .5;
  }
}
