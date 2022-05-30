import {IInputMethod} from "./IInputMethod";

export class KeyboardInput implements IInputMethod{
  keys = new Set()

  constructor() {
    const keys = this.keys
    document.addEventListener('keydown', function(event) {
      keys.add(event.key)
    });
    document.addEventListener('keyup', function(event) {
      keys.delete(event.key)
    });

  }

  getDown(): number {
    return this.keys.has("ArrowDown") && !this.keys.has("Control") ? 1 : 0;
  }

  getDownModified(): number {
    return this.keys.has("ArrowDown") && this.keys.has("Control") ? 1 : 0;
  }

  getLeft(): number {
    return this.keys.has("ArrowLeft") && !this.keys.has("Control") ? 1 : 0;
  }

  getLeftModified(): number {
    return this.keys.has("ArrowLeft") && this.keys.has("Control") ? 1 : 0;
  }

  getRight(): number {
    return this.keys.has("ArrowRight") && !this.keys.has("Control") ? 1 : 0;
  }

  getRightModified(): number {
    return this.keys.has("ArrowRight") && this.keys.has("Control") ? 1 : 0;
  }

  getUp(): number {
    return this.keys.has("ArrowUp") && !this.keys.has("Control") ? 1 : 0;
  }

  getUpModified(): number {
    return this.keys.has("ArrowUp") && this.keys.has("Control") ? 1 : 0;
  }

  setHitHandler(fn: () => void) {
    document.addEventListener('keypress', (e: KeyboardEvent) =>{
      if(e.key == 'Enter'){
        fn()
      }
    })
  }

  setSwitchHandler(fn: () => void): void {
    document.addEventListener('keypress', (e: KeyboardEvent) =>{
      if(e.key == 's'){
        fn()
      }
    })
  }

  setPerspectiveHandler(fn: () => void): void {
    document.addEventListener('keypress', (e: KeyboardEvent) =>{
      if(e.key == 'u'){
        fn()
      }
    })
  }

}
