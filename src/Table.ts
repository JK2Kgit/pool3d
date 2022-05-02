export class Table {
  static getPositions() {
    return [
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
  }

  static getIndices() {
    return [
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
      // BOTTOM
      32, 33, 40,

      33, 34, 40,
      34, 40, 41,

      34, 35, 41,

      35, 36, 41,
      36, 41, 42,

      36, 37, 42,

      37, 38, 42,
      38, 42, 43,

      38, 39, 43,

      39, 32, 43,
      32, 40, 43
    ]
  }
  static initBuffers(gl: WebGL2RenderingContext) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = Table.getPositions()
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.STATIC_DRAW);

    const gr = [0.35, 0.55, 0.26, 1.0]
    const br = [0.41, 0.22, 0.17, 1.0]
    const bl = [0.0, 0.0, 0.0, 1.0]
    const faceColors = [
      gr, gr, // TOP
      bl, bl, bl, bl, bl, bl, // holes
      br, br, br // BOttom
    ];
    let colors: number[] = [];

    for (let j = 0; j < faceColors.length; ++j) {
      const c = faceColors[j];
      colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = Table.getIndices();

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

    return {
      position: positionBuffer,
      color: colorBuffer,
      indices: indexBuffer,
    };
  }
}
