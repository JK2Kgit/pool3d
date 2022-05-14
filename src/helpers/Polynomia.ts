import CPX from "./Complex";
import {IComplex} from "./IComplex";


export const isZero = (x: number) => {
  return Math.abs(x) < 1e-15;
}
export const sqrt3 = (x: number) => {
  return x >= 0 ? Math.pow(x, 1/3) : -Math.pow(-x, 1/3);
}

export function solveLinear(a: number, b: number): IComplex[] {
  if (a === 0) return [];
  return [
    {re: -b / a, im: 0}
  ];
}

export function solveQuadratic(a: number, b: number, c: number): IComplex[]
{
  if (a === 0) return solveLinear(b, c);
  const delta = b ** 2 - 4 * a * c;
  const sqrtDelta = Math.sqrt(Math.abs(delta));
  if (isZero(delta)) {
    return [
      { re: -b / (2 * a), im: 0 },
    ];
  } else if(delta > 0) {
    return [
      { re: (-b + sqrtDelta) / (2 * a), im: 0 },
      { re: (-b - sqrtDelta) / (2 * a), im: 0 },
    ]
  } else {
    return [
      {re: -b / (2 * a), im:  sqrtDelta / (2 * a) },
      {re: -b / (2 * a), im: -sqrtDelta / (2 * a) },
    ]
  }
}

export function solveCubic(a: number, b: number, c: number, d: number): IComplex[] {
  if (a === 0) return solveQuadratic(b, c, d);
  const B = b / a,
    C = c / a,
    D = d / a;
  const p = C - B ** 2 / 3,
    q = D - B * C / 3 + 2 * B ** 3 /27;
  const Delta = q ** 2 + 4 * p ** 3 / 27;

  if (isZero(p) && isZero(q)) {
    return [
      {re: -B / 3, im: 0}
    ];
  }

  const b3 = -B /3;
  const ang2Pi3 = Math.PI * 2 / 3;
  if (isZero(Delta)) {
    return [
      {re: b3 - sqrt3(4 * q), im: 0 },
      {re: b3 + sqrt3(q / 2), im: 0 },
    ]
  } else if (Delta < 0) {
    const r = Math.sqrt(-p / 3);
    const u3: IComplex = {
      re: -q / 2,
      im: Math.sqrt(-Delta) / 2
    }
    const u3Ang = CPX.getAng(u3);
    return [0, 1, 2]
      .map(k => {return {
        re: b3 + 2 * r * Math.cos(u3Ang / 3 + ang2Pi3 * k),
        im: 0
      }});
  } else {
    const u1 = sqrt3((-q + Math.sqrt(Delta)) / 2);
    const v1 = -p / 3 / u1;
    const u2 = CPX.multiplyReal(CPX.fromLenAndAng(1,  ang2Pi3), u1);
    const v2 = CPX.multiplyReal(CPX.fromLenAndAng(1, -ang2Pi3), v1);
    const u3 = CPX.multiplyReal(CPX.fromLenAndAng(1, -ang2Pi3), u1);
    const v3 = CPX.multiplyReal(CPX.fromLenAndAng(1,  ang2Pi3), v1);
    return [
      { re: u1 + v1, im: 0 },
      CPX.add(u2, v2),
      CPX.add(u3, v3)
    ]
      .map(y => {return {re: y.re + b3, im: y.im }});
  }
  // For Delta > 0 and Delta < 0, we can unnify them, i.e. CPX.sqrtn(C, 3).
  // But condidering the calculation precision, it would be possible that
  // the result is truly some real, but it is presented as a complex with very small
  // imagenary part. So here we can split it to different case, to ensure that we get
  // very clear and definite results for "pure-real" roots, with imagenry part being 0.
}


export function solveQuartic(a: number, b: number, c: number, d: number, e: number): IComplex[] {
  if (a === 0) return solveCubic(b, c, d, e);
  const B = b / a,
    C = c / a,
    D = d / a,
    E = e / a;
  const p = C - 3 * B ** 2 / 8,
    q = B ** 3 / 8 - B * C / 2 + D,
    r = -3 * B ** 4 / 256 + B ** 2 * C / 16 - B * D / 4 + E;
  const b4 = -B / 4;
  // Now make some quick judgements
  let ys: IComplex[] = [];
  if (isZero(p) && isZero(q) && isZero(r)) {
    ys = [{re: 0, im: 0}];
  } else if (isZero(p) && isZero(q)) {
    ys = CPX.sqrtn({re: -4, im: 0}, 4);
  } else if (isZero(q) && isZero(r)) {
    ys = [
      {re: 0, im: 0},
      ...(CPX.sqrt2({re: -p, im: 0}))
    ]
  } else if (isZero(p) && isZero(r)) {
    ys = [
      {re: 0, im: 0},
      ...(CPX.sqrtn({re: -q, im: 0}, 3))
    ]
  } else if (isZero(r)) {
    ys = [
      {re: 0, im: 0},
      ...(solveCubic(1, 0, p, q))
    ]
  } else if (isZero(q)) {
    ys = [];
    solveQuadratic(1, p, r)
      .forEach(y => {
        ys.push(...(CPX.sqrt2(y)));
      });
  } else {
    ys = [];
    const ms = solveCubic(1, -p/2, -r, (4 * p * r - q ** 2) / 8);
    const m1 = ms.filter(m => isZero(m.im))[0].re;
    const alpha = q / (2 * (2 * m1 - p));
    // const cBeta =  new CNumber(2 * m1 -p, 0);
    CPX.sqrt2({re: 2 * m1 - p, im: 0})
      .forEach(beta => {
        const cRe: IComplex = {re: -2 * m1 - p, im: 0};
        const cIm: IComplex = CPX.multiplyReal(beta, -4 * alpha);
        const cInSqrt: IComplex = CPX.add(cRe, cIm);
        CPX.sqrt2(cInSqrt)
          .map(y => {
            return CPX.multiplyReal(CPX.add(beta, y), 0.5);
          })
          .forEach(y => {
            ys.push(y);
          });
      });
  }
  // convert from y to x
  return ys.map(y => {return {re: b4 + y.re, im: y.im}});
}