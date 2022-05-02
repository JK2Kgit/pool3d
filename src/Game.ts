import {IPlayer} from "./Player/IPlayer";
import {Table} from "./Table";
import * as mat4 from "./matrix/mat4"
import * as wh from "./helpers/helpers"
import {Transform} from "./Transform";
import {Vector3ToArray} from "./helpers/Vector3";

export class Game {
  canvas: HTMLCanvasElement
  gl: WebGL2RenderingContext
  textCanvas: HTMLCanvasElement
  textContext: CanvasRenderingContext2D
  players: IPlayer[]
  lastFrame: number
  frameCounter: number
  currentPlayer: number
  locked: boolean
  table: Table
  programInfo: any
  buffers: any
  cameraTransform: Transform =  new Transform({x: 0, y:1, z: 10}, {x: Math.PI/5.7, y: 0, z: 0})

  constructor(canvas: HTMLCanvasElement, textCanvas: HTMLCanvasElement, player0: IPlayer, player1: IPlayer) {
    this.canvas = canvas
    this.textCanvas = textCanvas
    this.players = [player0, player1]
    this.gl = canvas.getContext('webgl2')!;
    this.textContext = textCanvas.getContext('2d')!;
    this.lastFrame = Date.now()
    this.frameCounter = 0
    this.currentPlayer = 0
    this.locked = false
    this.table = new Table()
  }

  start() {
    this.lastFrame = Date.now()
    this.programInfo = wh.createProgramInfo(this.gl, ["vs", "fs"])
    this.buffers = Table.initBuffers(this.gl);
    this.players[this.currentPlayer].setTransform(this.cameraTransform)
    window.requestAnimationFrame(() => this.frame());
  }

  frame() {
    const dt = (Date.now() - this.lastFrame) / 1000
    this.lastFrame = Date.now()
    const fps = Math.round(1 / dt);
    this.textContext.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
    this.drawFps(fps)
    this.update(dt)
    window.requestAnimationFrame(() => this.frame());
  }

  drawFps(fps: number) {
    this.textContext.font = '25px Arial';
    this.textContext.fillStyle = 'black';
    this.textContext.fillText("FPS: " + fps, 10, 30);
  }

  update(dt: number) {

    if(!this.locked){
      this.cameraTransform = this.players[this.currentPlayer].handleInput(dt)
    }
    this.drawScene();

  }

  drawScene() {
    this.drawTable()

  }

  drawTable() {
    const gl = this.gl
    const buffers = this.buffers
    const programInfo = this.programInfo
    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);

    gl.depthFunc(gl.LEQUAL)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
      fieldOfView,
      aspect,
      zNear,
      zFar);

    const modelViewMatrix = mat4.create();


    mat4.translate(modelViewMatrix,
      modelViewMatrix,
      Vector3ToArray(this.cameraTransform.position))


    mat4.rotate(modelViewMatrix,
      modelViewMatrix,
      this.cameraTransform.rotation.x,
      [1, 0, 0])
    mat4.rotate(modelViewMatrix,
      modelViewMatrix,
      this.cameraTransform.rotation.y,
      [0, 1, 0])


    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
    }

    {
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

    {
      const offset = 0;
      const vertexCount = Table.getIndices().length;
      const type = gl.UNSIGNED_SHORT;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}