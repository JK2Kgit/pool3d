
import { IComplex } from "./IComplex";

const ZERO: IComplex = {
  re: 0,
  im: 0
};

function isZero(c: IComplex): boolean {
  return c.re === 0 && c.im === 0;
}

function getLen(c: IComplex): number {
  return Math.sqrt(c.re ** 2 + c.im ** 2);
}

function getAng(c: IComplex): number {
  if (c.re === 0) {
    return c.im > 0
      ? Math.PI / 2
      : c.im < 0
        ? Math.PI * 3 / 2
        : 0;
  } else {
    const arcTan = Math.atan(c.im / c.re);
    if (c.re < 0) return arcTan + Math.PI;
    else if (c.im >= 0) return arcTan;
    else return arcTan + Math.PI * 2;
  }
}

function fromLenAndAng(len: number, ang: number): IComplex
{
  return {
    re: len * Math.cos(ang),
    im: len * Math.sin(ang)
  };
}

function sqrt2(c: IComplex): IComplex[] {
  if (isZero(c)) {
    return [ZERO];
  }
  // To make it compatible with real number square root operation
  if (c.im === 0) {
    return c.re >= 0
      ? [{re:  Math.sqrt(c.re), im: 0},
        {re: -Math.sqrt(c.re), im: 0}]
      : [{re: 0, im:  Math.sqrt(-c.re)},
        {re: 0, im: -Math.sqrt(-c.re)}];
  }
  const sqrt = fromLenAndAng(Math.sqrt(getLen(c)), getAng(c) / 2);
  return [
    {re:  sqrt.re, im:  sqrt.im},
    {re: -sqrt.re, im: -sqrt.im},
  ];
}

function sqrtn(c: IComplex, n: number): IComplex[] {
  if (isZero(c)) {
    return [ZERO];
  }
  const sqrtnLen = Math.pow(getLen(c), 1/n);
  const cAng = getAng(c);
  const res = [];
  for (let i = 0; i < n; i++) {
    res.push(fromLenAndAng(sqrtnLen, (cAng + 2 * Math.PI * i) / n));
  }
  return res;
}

function reciprocal(c: IComplex): IComplex {
  if (isZero(c)) return ZERO;
  else {
    const denom = c.re ** 2 + c.im ** 2;
    return {
      re:  c.re / denom,
      im: -c.im / denom
    };
  }
}

function add(c1: IComplex, c2: IComplex): IComplex {
  return {
    re: c1.re + c2.re,
    im: c1.im + c2.im
  }
}

function substract(c1: IComplex, c2: IComplex): IComplex {
  return {
    re: c1.re - c2.re,
    im: c1.im - c2.im
  }
}

function multiply(c1: IComplex, c2: IComplex): IComplex {
  return {
    re: c1.re * c2.re - c1.im * c2.im,
    im: c1.re * c2.im + c1.im * c2.re
  }
}

function multiplyReal(c: IComplex, r: number): IComplex {
  return {
    re: c.re * r,
    im: c.im * r
  }
}

function devide(c1: IComplex, c2: IComplex): IComplex {
  if (isZero(c2)) return ZERO;
  return multiply(c1, reciprocal(c2));
}

export default {
  ZERO,
  isZero,
  getLen,
  getAng,
  fromLenAndAng,
  sqrt2,
  sqrtn,
  reciprocal,
  add,
  substract,
  multiply,
  multiplyReal,
  devide,
}