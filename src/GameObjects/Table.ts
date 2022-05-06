import * as mat4 from "../matrix/mat4";
import {Vector3, Vector3ToArray} from "../helpers/Vector3";
import {Transform} from "./Transform";
import {FOV, TABLE_HEIGHT} from "../helpers/Constants";
import {GameObject} from "./GameObject";

export class Table extends GameObject{
  position: Vector3 = {x: 0, y: 0, z: -TABLE_HEIGHT}

  constructor(gl: WebGL2RenderingContext, programInfo: any) {
    super(gl, programInfo);
    this.buffers = this.initBuffers();
  }

  initBuffers() {
    const gl = this.gl

    function getBuffers(i: number) {
      const positionBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      const positions = Table.getPositions(i)
      gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);

      const gr = [0.35, 0.55, 0.26, 1.0]
      const bl = [0.0, 0.0, 0.0, 1.0]
      const faceColors = [[
        gr, gr, // TOP
        bl, bl, bl, bl, bl, bl,],
        [gr, gr, gr],
        [gr, gr, gr]
      ];
      let colors: number[] = [];

      for (let j = 0; j < faceColors[i].length; ++j) {
        const c = faceColors[i][j];
        colors = colors.concat(c, c, c, c);
      }

      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      const indices = Table.getIndices(i);

      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);
      return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
      }
    }

    return [getBuffers(0), getBuffers(1), getBuffers(2)];
  }

  draw(cameraTransform: Transform) {
    const gl = this.gl
    const buffersArr = this.buffers
    const programInfo = this.programInfo

    const fieldOfView = FOV * Math.PI / 180;
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
      Vector3ToArray(this.position))


    mat4.rotate(modelViewMatrix,
      modelViewMatrix,
      cameraTransform.rotation.x,
      [1, 0, 0])
    mat4.rotate(modelViewMatrix,
      modelViewMatrix,
      cameraTransform.rotation.y,
      [0, 1, 0])

    mat4.translate(modelViewMatrix,
      modelViewMatrix,
      Vector3ToArray(cameraTransform.position))

    gl.uniform4fv(programInfo.uniformLocations.accentColor, [0.41, 0.22, 0.17, 1])

    drawPart(0)
    drawPart(1)
    drawPart(2)

    function drawPart(i: number) {
      const buffers = buffersArr[i]

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


      gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
      gl.uniform1i(programInfo.uniformLocations.modelTextureType, [0, 1, 2][i]);

      {
        const offset = 0;
        const vertexCount = Table.getIndices(i).length;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      }

    }
  }

  static getPositions(i: number) {
    const bottom = [
      //Bottom
      1.65, 0.0, 5.0,
      2.5, 0.0, 4.15,
      2.5, 0.0, -4.15,
      1.65, 0.0, -5.0,
      -1.65, 0.0, -5.0,
      -2.5, 0.0, -4.15,
      -2.5, 0.0, 4.15,
      -1.65, 0.0, 5.0,

      1.65, -2.0, 4.15,
      1.65, -2.0, -4.15,
      -1.65, -2.0, -4.15,
      -1.65, -2.0, 4.15,
    ]
    return [[
      // TOP
      1.65, 0.0, 5.0,
      2.5, 0.0, 4.15,
      2.5, 0.0, -4.15,
      1.65, 0.0, -5.0,
      -1.65, 0.0, -5.0,
      -2.5, 0.0, -4.15,
      -2.5, 0.0, 4.15,
      -1.65, 0.0, 5.0,
      // HOLES
      1.65, 0.0, 5.0,
      2.11, 0.0, 5.24,
      2.74, 0.0, 4.61,
      2.5, 0.0, 4.15,

      2.5, 0.0, 0.5,
      2.9, 0.0, 0.375,
      2.9, 0.0, -0.375,
      2.5, 0.0, -0.5,

      1.65, 0.0, -5.0,
      2.11, 0.0, -5.24,
      2.74, 0.0, -4.61,
      2.5, 0.0, -4.15,

      -1.65, 0.0, -5.0,
      -2.11, 0.0, -5.24,
      -2.74, 0.0, -4.61,
      -2.5, 0.0, -4.15,

      -2.5, 0.0, 0.5,
      -2.9, 0.0, 0.375,
      -2.9, 0.0, -0.375,
      -2.5, 0.0, -0.5,

      -1.65, 0.0, 5.0,
      -2.11, 0.0, 5.24,
      -2.74, 0.0, 4.61,
      -2.5, 0.0, 4.15,

    ], bottom, bottom
    ][i]
  }

  static getIndices(i: number) {
    return [[
      // Top
      0, 1, 2,
      0, 2, 3,
      0, 3, 7,
      3, 4, 7,
      4, 6, 7,
      4, 5, 6,
      // HOLES
      8, 9, 10,
      8, 10, 11,
      12, 13, 14,
      12, 14, 15,
      16, 17, 18,
      16, 18, 19,
      20, 21, 22,
      20, 22, 23,
      24, 25, 26,
      24, 26, 27,
      28, 29, 30,
      28, 30, 31,
    ], [
      1, 2, 8,
      2, 8, 9,
      3, 4, 9,
      4, 9, 10,
      5, 6, 10,
      6, 10, 11,
      7, 0, 11,
      0, 8, 11,
    ], [
      0, 1, 8,
      2, 3, 9,
      4, 5, 10,
      6, 7, 11
    ]][i]
  }
}
