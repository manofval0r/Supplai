import * as THREE from 'three';

/** Studio environment: bright soft boxes around a dark dome, baked to a PMREM for real reflections. */
export function makeEnvironment(
  renderer: THREE.WebGLRenderer,
): THREE.Texture | null {
  try {
    const s = new THREE.Scene();
    s.background = new THREE.Color(0x2c3552);
    const box = (
      w: number,
      h: number,
      x: number,
      y: number,
      z: number,
      i: number,
    ) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(i, i, i),
          side: THREE.DoubleSide,
        }),
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      s.add(m);
    };
    box(10, 5, 0, 7, 3, 5);
    box(3, 9, -7, 1, 3, 6);
    box(3, 9, 7, 1, -1, 4);
    box(12, 3, 0, -4, 6, 1.2);
    box(6, 6, 0, 2, -8, 3);
    const gen = new THREE.PMREMGenerator(renderer);
    const tex = gen.fromScene(s, 0.04).texture;
    gen.dispose();
    return tex;
  } catch {
    return null;
  }
}

export function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Bevelled rounded box, centred on the origin. */
export function roundedBox(
  w: number,
  h: number,
  d: number,
  r: number,
  b: number,
) {
  const g = new THREE.ExtrudeGeometry(
    roundedRectShape(w - 2 * b, h - 2 * b, Math.max(r - b, 0.001)),
    {
      depth: d - 2 * b,
      bevelEnabled: true,
      bevelThickness: b,
      bevelSize: b,
      bevelSegments: 4,
      curveSegments: 8,
    },
  );
  g.translate(0, 0, -(d - 2 * b) / 2);
  return g;
}

export function roundedPolygon(points: [number, number][], r: number) {
  const s = new THREE.Shape();
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a = points[(i + n - 1) % n];
    const b = points[i];
    const c = points[(i + 1) % n];
    const v1 = new THREE.Vector2(a[0] - b[0], a[1] - b[1]).normalize();
    const v2 = new THREE.Vector2(c[0] - b[0], c[1] - b[1]).normalize();
    const x1 = b[0] + v1.x * r;
    const y1 = b[1] + v1.y * r;
    const x2 = b[0] + v2.x * r;
    const y2 = b[1] + v2.y * r;
    if (i === 0) s.moveTo(x1, y1);
    else s.lineTo(x1, y1);
    s.quadraticCurveTo(b[0], b[1], x2, y2);
  }
  s.closePath();
  return s;
}

export function crossShape(L: number, a: number, r: number) {
  const h = a / 2;
  return roundedPolygon(
    [
      [-h, L],
      [h, L],
      [h, h],
      [L, h],
      [L, -h],
      [h, -h],
      [h, -L],
      [-h, -L],
      [-h, -h],
      [-L, -h],
      [-L, h],
      [-h, h],
    ],
    r,
  );
}

/** Soft contact shadow blob, drawn as a radial gradient from a tiny data texture. */
export function contactShadow(y: number, size: number) {
  const N = 64;
  const data = new Uint8Array(N * N * 4);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const dx = (i - N / 2) / (N / 2);
      const dy = (j - N / 2) / (N / 2);
      const d = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      const a = Math.pow(1 - d, 1.6) * 0.3;
      const k = (j * N + i) * 4;
      data[k] = 25;
      data[k + 1] = 40;
      data[k + 2] = 90;
      data[k + 3] = Math.round(a * 255);
    }
  }
  const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  tex.needsUpdate = true;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  return m;
}

/** Puffed foil pouch face: bulges in the middle, flat at the crimped ends. */
export function pillowFace(
  w: number,
  h: number,
  bulge: number,
  mat: THREE.Material,
) {
  const g = new THREE.PlaneGeometry(w, h, 40, 56);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (w / 2);
    const y = Math.abs(p.getY(i) / (h / 2));
    const ex = Math.max(0, 1 - Math.pow(Math.abs(x), 2.4));
    const ey = Math.min(1, Math.max(0, (0.9 - y) / 0.34));
    const sm = ey * ey * (3 - 2 * ey);
    p.setZ(i, bulge * Math.pow(ex, 0.55) * sm);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

/** Critically-underdamped scalar spring for tactile motion without a native animation library. */
export class Spring {
  value: number;
  target: number;
  velocity = 0;
  constructor(
    initial: number,
    private stiffness = 170,
    private damping = 11,
  ) {
    this.value = initial;
    this.target = initial;
  }
  step(dt: number) {
    const f =
      -this.stiffness * (this.value - this.target) -
      this.damping * this.velocity;
    this.velocity += f * dt;
    this.value += this.velocity * dt;
    return this.value;
  }
}
