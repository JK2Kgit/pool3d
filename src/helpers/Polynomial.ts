function negate(p: number[]): number[] {
  const p_: number[] = [];
  for (let i=0; i<p.length; i++) {
    p_.push(-p[i]);
  }

  return p_;
}

function reflectAboutYAxis(p: number[]): number[] {
  const d = p.length-1;

  if (d < 0) { return []; }

  const result = p.slice();
  for (let i=0; i<d+1; i++) {
    if (i % 2) {
      result[i] = -result[i];
    }
  }

  return result;
}

function positiveToNegativeBound(positiveBoundFunction: (p: number[]) => number) {
  return (p: number[]): number => {
    return -positiveBoundFunction(reflectAboutYAxis(p));
  }
}

function differentiate(p: number[]): number[] {
  const result: number[] = [];

  const d = p.length - 1;
  for (let i=0; i<d; i++) {
    result.push((d-i) * p[i]);
  }

  return result;
}

function Horner(p: number[], x: number): number {
  let q = 0;
  for (let i=0; i<p.length; i++) {
    q = q*x + p[i];
  }

  return q;
}

function brentPoly(
  p: number[],
  lb: number,
  ub: number,
  fa = Horner(p,lb),
  fb = Horner(p,ub)): number {

  const eps = Number.EPSILON;
  const u = eps/2;
  const abs = Math.abs;
  const max = Math.max;

  let a = lb;
  let b = ub;

  let c = a;
  let fc = fa;
  let e = b - a;
  let d = e;

  while (true) {
    if (abs(fc) < abs(fb)) {
      a = b; b = c; c = a;
      fa = fb; fb = fc; fc = fa;
    }

    const δ = 2 * u * max(1,abs(a),abs(b));

    const m = 0.5*(c - b);

    if (abs(m) <= δ) {
      return b;
    }

    if (abs(e) < δ || abs(fa) <= abs(fb)) {
      e = m;
      d = e;
    } else {
      let s = fb / fa;
      let p: number;
      let q: number;
      if (a === c) {
        p = 2*m*s;
        q = 1 - s;
      } else {
        q = fa / fc;
        const r = fb / fc;
        p = s*(2*m*q*(q - r) - (b - a)*(r - 1));
        q = (q - 1)*(r - 1)*(s - 1);
      }

      if (0 < p) { q = -q; } else { p = -p; }

      s = e;
      e = d;

      if (2*p < 3*m*q - abs(δ*q) && p < abs(0.5*s*q)) {
        d = p / q;
      } else {
        e = m;
        d = e;
      }
    }
    a = b;
    fa = fb;

    if (δ < abs(d)) {
      b = b + d;
    } else if (0 < m) {
      b = b + δ;
    } else {
      b = b - δ;
    }

    fb = Horner(p,b);

    if (fb === 0) {
      return b;
    }

    if (fb*fc > 0) {
      c = a;
      fc = fa;
      e = b - a;
      d = e;
    }
  }
}


function positiveRootUpperBound_LMQ(p: number[]): number {
  const deg = p.length-1;
  if (deg < 1) {
    return 0;
  }

  if (p[0] < 0) { p = negate(p); }

  const timesUsed = [];
  for (let i=0; i<deg; i++) {
    timesUsed.push(1);
  }

  let ub = 0;

  for (let m=0; m<=deg; m++) {
    if (p[m] >= 0) { continue; }

    let tempub = Number.POSITIVE_INFINITY;
    let any = false;

    for (let k=0; k<m; k++) {
      if (p[k] <= 0) { continue; }

      const temp = (-p[m] / (p[k] / 2**timesUsed[k]))**(1/(m-k));

      timesUsed[k]++;

      if (tempub > temp) { tempub = temp; }

      any = true;
    }

    if (any && ub < tempub)
      ub = tempub;
  }

  return ub;
}

const negativeRootUpperBound_LMQ = positiveToNegativeBound(positiveRootUpperBound_LMQ);
function removeLeadingZeros(p: number[]): number[] {
  let lzCount = 0;
  for (let i=0; i<=p.length-1; i++) {
    if (p[i] !== 0) {
      break;
    }
    lzCount++;
  }

  if (lzCount !== 0) {
    p = p.slice(lzCount);
  }

  return p;
}



function allRoots(
  p: number[],
  lb = Number.NEGATIVE_INFINITY,
  ub = Number.POSITIVE_INFINITY): number[] {

  p = removeLeadingZeros(p);

  let numZerosAtZero = 0;
  while (p[p.length-1] === 0) {
    p = p.slice(0,-1);
    numZerosAtZero++;
  }

  if (p.length <= 1) {
    const roots = [];
    for (let j=0; j<numZerosAtZero; j++) {
      roots.push(0);
    }
    return roots;
  }

  if (lb === Number.NEGATIVE_INFINITY) {
    lb = negativeRootUpperBound_LMQ(p);
  }

  if (ub === Number.POSITIVE_INFINITY) {
    ub = positiveRootUpperBound_LMQ(p);
  }

  const ps = [p];
  for (let i=1; i<=p.length-1; i++) {
    ps.push(differentiate(ps[i-1]));
  }

  let is: number[] = [];
  for (let diffCount=p.length-2; diffCount>=0; diffCount--) {
    const p = ps[diffCount];
    const roots: number[] = [];

    let _a_ = lb;
    let _A_ = Horner(p, _a_);

    if (_A_ === 0 && diffCount === 0) {
      roots.push(lb);
    }

    for (let i=0; i<is.length; i++) {
      const _b_ = is[i];
      const _B_ = Horner(p, _b_);

      if (_B_ === 0) {
        roots.push(_b_);
      } else if (_A_*_B_ < 0) {
        roots.push(brentPoly(p, _a_, _b_, _A_, _B_));
      }

      _a_ = _b_;
      _A_ = _B_;
    }

    const _B_ = Horner(p, ub);
    if (_A_*_B_ < 0) {
      roots.push(brentPoly(p, _a_, ub, _A_, _B_));
    }

    if (_B_ === 0 && diffCount === 0) {
      roots.push(ub);
    }

    is = roots;
  }

  if (numZerosAtZero > 0 && lb <= 0 && ub >= 0) {
    let isWithZeroRoots: number[] = [];
    let zerosInserted = false;
    for (let i=0; i<is.length; i++) {
      if (!zerosInserted && is[i] >= 0) {
        for (let j=0; j<numZerosAtZero; j++) {
          isWithZeroRoots.push(0);
        }
        zerosInserted = true;
      }
      isWithZeroRoots.push(is[i]);
    }
    return isWithZeroRoots;
  }

  return is;
}


export { allRoots }
