import {IPlayer, PlayerInput} from "./IPlayer";

export class AIPlayer extends IPlayer{
  getInput(): PlayerInput {
    return new PlayerInput(
      Math.random()*2 -1, Math.random()*2 -1, Math.random()*2 -1,
      Math.random()*2 -1, Math.random()*2 -1, Math.random()*2 -1);
  }


}
