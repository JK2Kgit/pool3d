export abstract class GameObject{
  gl: WebGL2RenderingContext
  buffers: any
  programInfo: any

  constructor(gl: WebGL2RenderingContext, programInfo: any) {
    this.gl = gl
    this.programInfo = programInfo
  }

  abstract initBuffers(): {position: WebGLBuffer | null, color: WebGLBuffer | null, indices: WebGLBuffer | null}[]
}