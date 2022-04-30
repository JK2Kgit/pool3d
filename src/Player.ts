import {IPlayer, PlayerInput} from "./IPlayer";

export class Player extends IPlayer{
  getInput(): PlayerInput {
    return new PlayerInput(0,0,0,0,0,0);
  }


}
