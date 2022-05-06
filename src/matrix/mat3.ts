
export function create() {
  let out = new Float32Array(9);
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

export function fromValues(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number) {
  let out = new Float32Array(9);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
