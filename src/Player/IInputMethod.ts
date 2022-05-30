export interface IInputMethod{
  getLeft(): number // rotate left
  getRight(): number // rotate right
  getUp(): number // hit/ rotate top
  getDown(): number // hit/rotate bottom

  getLeftModified(): number // hit left
  getRightModified(): number// hit right
  getUpModified(): number // strength up
  getDownModified(): number // strength down

  setHitHandler(fn: () => void): void
  setSwitchHandler(fn: () => void): void
  setPerspectiveHandler(fn: () => void): void
}