import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  PanResponder,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

function neutralizeWebGL1Check() {
  try {
    const g = globalThis as unknown as Record<
      string,
      { [Symbol.hasInstance]?: () => boolean }
    >;
    if (g.WebGLRenderingContext) {
      Object.defineProperty(g.WebGLRenderingContext, Symbol.hasInstance, {
        value: () => false,
        configurable: true,
      });
    }
  } catch (err) {
    void err;
  }
}

neutralizeWebGL1Check();

function makeRoundedBox(
  w: number,
  h: number,
  d: number,
  r: number,
  smooth = 4,
) {
  const s = new THREE.Shape();
  const x = -w / 2 + r;
  const y = -h / 2 + r;
  const W = w - r * 2;
  const H = h - r * 2;
  s.moveTo(x, y - r);
  s.lineTo(x + W, y - r);
  s.quadraticCurveTo(x + W + r, y - r, x + W + r, y);
  s.lineTo(x + W + r, y + H);
  s.quadraticCurveTo(x + W + r, y + H + r, x + W, y + H + r);
  s.lineTo(x, y + H + r);
  s.quadraticCurveTo(x - r, y + H + r, x - r, y + H);
  s.lineTo(x - r, y);
  s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: Math.max(0.01, d - r * 2),
    bevelEnabled: true,
    bevelSegments: smooth,
    steps: 1,
    bevelSize: r,
    bevelThickness: r,
    curveSegments: smooth * 2,
  });
  g.center();
  return g;
}

function makeCross(
  size: number,
  thickness: number,
  depth: number,
  color: number,
) {
  const grp = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.22,
    metalness: 0.08,
  });
  const v = new THREE.Mesh(
    makeRoundedBox(thickness, size, depth, thickness * 0.22, 2),
    mat,
  );
  const h = new THREE.Mesh(
    makeRoundedBox(size, thickness, depth, thickness * 0.22, 2),
    mat,
  );
  grp.add(v, h);
  return grp;
}

export type Stage3DKind =
  'drug' | 'crate' | 'mini-req' | 'mini-rel' | 'mini-trk';

export function Stage3D({
  kind,
  drug = 'ors',
  height = 200,
  width,
  interactive = true,
  style,
}: {
  kind: Stage3DKind;
  drug?: 'ors' | 'zinc';
  height?: number;
  width?: number;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const winWidth = Dimensions.get('window').width;
  const finalWidth = width ?? Math.max(280, winWidth - 44);

  const stateRef = useRef<{
    drug: 'ors' | 'zinc';
    orsGrp?: THREE.Group;
    zincGrp?: THREE.Group;
    targetX: number;
    targetY: number;
    rotX: number;
    rotY: number;
    dragging: boolean;
    raf: number;
  }>({
    drug,
    targetX: kind === 'crate' ? 0.3 : 0.14,
    targetY: kind === 'crate' ? 0.54 : -0.26,
    rotX: kind === 'crate' ? 0.3 : 0.14,
    rotY: kind === 'crate' ? 0.54 : -0.26,
    dragging: false,
    raf: 0,
  });

  stateRef.current.drug = drug;
  if (stateRef.current.orsGrp && stateRef.current.zincGrp) {
    stateRef.current.orsGrp.visible = drug === 'ors';
    stateRef.current.zincGrp.visible = drug === 'zinc';
  }

  useEffect(() => {
    stateRef.current.drug = drug;
    if (stateRef.current.orsGrp && stateRef.current.zincGrp) {
      stateRef.current.orsGrp.visible = drug === 'ors';
      stateRef.current.zincGrp.visible = drug === 'zinc';
      stateRef.current.targetX = drug === 'ors' ? 0.14 : 0.22;
      stateRef.current.targetY = drug === 'ors' ? -0.26 : -0.42;
    }
  }, [drug]);

  useEffect(() => {
    return () => {
      if (stateRef.current.raf) cancelAnimationFrame(stateRef.current.raf);
    };
  }, []);

  const lastTouch = useRef({ x: 0, y: 0 });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => interactive,
      onMoveShouldSetPanResponder: (_, g) =>
        interactive && (Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3),
      onPanResponderGrant: (e) => {
        stateRef.current.dragging = true;
        lastTouch.current = {
          x: e.nativeEvent.pageX,
          y: e.nativeEvent.pageY,
        };
      },
      onPanResponderMove: (e) => {
        const nx = e.nativeEvent.pageX;
        const ny = e.nativeEvent.pageY;
        const dx = nx - lastTouch.current.x;
        const dy = ny - lastTouch.current.y;
        lastTouch.current = { x: nx, y: ny };
        stateRef.current.targetY += dx * 0.011;
        stateRef.current.targetX = Math.max(
          -0.65,
          Math.min(0.75, stateRef.current.targetX + dy * 0.009),
        );
      },
      onPanResponderRelease: () => {
        stateRef.current.dragging = false;
      },
      onPanResponderTerminate: () => {
        stateRef.current.dragging = false;
      },
    }),
  ).current;

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    try {
      neutralizeWebGL1Check();
      const g = globalThis as unknown as Record<string, unknown>;
      const savedWGL = g.WebGLRenderingContext;
      g.WebGLRenderingContext = undefined;
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new Renderer({ gl });
      } finally {
        if (savedWGL !== undefined) {
          g.WebGLRenderingContext = savedWGL;
        }
      }
      const isMini = kind.startsWith('mini-');
      const dw =
        gl.drawingBufferWidth > 0
          ? gl.drawingBufferWidth
          : Math.round(finalWidth * 3);
      const dh =
        gl.drawingBufferHeight > 0
          ? gl.drawingBufferHeight
          : Math.round(height * 3);
      renderer.setSize(dw, dh);
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        isMini ? 32 : 30,
        dw / Math.max(1, dh),
        0.1,
        50,
      );
      camera.position.set(0, 0, isMini ? 5.1 : 4.8);

      scene.add(new THREE.AmbientLight(0xffffff, isMini ? 1.3 : 1.2));
      const key = new THREE.DirectionalLight(0xffffff, 1.55);
      key.position.set(3, 5, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xbfd4ff, 0.75);
      rim.position.set(-4, -2, -3);
      scene.add(rim);

      let rootGrp: THREE.Group | null = null;
      let miniAnim: ((t: number) => void) | null = null;

      if (kind === 'mini-req') {
        const grp = new THREE.Group();

        // 3D Sachet body (white/pearl medical foil)
        const body = new THREE.Mesh(
          makeRoundedBox(1.5, 1.95, 0.24, 0.12, 3),
          new THREE.MeshStandardMaterial({
            color: 0xf8faff,
            roughness: 0.25,
            metalness: 0.18,
          }),
        );
        grp.add(body);

        // Top & bottom crimped foil seal bands
        const crimpMat = new THREE.MeshStandardMaterial({
          color: 0xd8e3f2,
          roughness: 0.25,
          metalness: 0.58,
        });
        const topCrimp = new THREE.Mesh(
          makeRoundedBox(1.54, 0.22, 0.26, 0.04, 2),
          crimpMat,
        );
        topCrimp.position.y = 0.96;
        const botCrimp = new THREE.Mesh(
          makeRoundedBox(1.54, 0.22, 0.26, 0.04, 2),
          crimpMat,
        );
        botCrimp.position.y = -0.96;
        grp.add(topCrimp, botCrimp);

        // Cobalt Blue central brand label plate
        const labelPlate = new THREE.Mesh(
          makeRoundedBox(1.24, 1.05, 0.04, 0.06, 2),
          new THREE.MeshStandardMaterial({
            color: 0x1558c9,
            roughness: 0.25,
            metalness: 0.08,
          }),
        );
        labelPlate.position.z = 0.135;
        grp.add(labelPlate);

        // 3D Acid Lime Medical Cross
        const cross = makeCross(0.52, 0.16, 0.04, 0xd4ff24);
        cross.position.set(0, 0.14, 0.165);
        grp.add(cross);

        // Acid Lime dosage badge
        const dosageBadge = new THREE.Mesh(
          makeRoundedBox(0.82, 0.18, 0.03, 0.04, 2),
          new THREE.MeshStandardMaterial({
            color: 0xd4ff24,
            roughness: 0.2,
          }),
        );
        dosageBadge.position.set(0, -0.32, 0.16);
        grp.add(dosageBadge);

        // Floating orbiting pills
        const tabGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 20);
        tabGeo.rotateX(Math.PI / 2);
        const t1 = new THREE.Mesh(
          tabGeo,
          new THREE.MeshStandardMaterial({ color: 0xd4ff24, roughness: 0.22 }),
        );
        t1.position.set(0.95, -0.52, 0.45);
        t1.rotation.set(0.3, -0.4, 0.2);
        grp.add(t1);

        const t2 = new THREE.Mesh(
          tabGeo,
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22 }),
        );
        t2.position.set(-0.92, 0.52, 0.38);
        t2.rotation.set(-0.3, 0.4, -0.2);
        grp.add(t2);

        scene.add(grp);
        miniAnim = (t) => {
          grp.rotation.y = Math.sin(t * 1.1) * 0.38 - 0.22;
          grp.rotation.x = 0.14 + Math.cos(t * 0.9) * 0.08;
          grp.position.y = Math.sin(t * 1.5) * 0.07;
          t1.rotation.z = t * 0.8;
          t2.rotation.z = -t * 0.8;
        };
      } else if (kind === 'mini-rel') {
        const grp = new THREE.Group();
        const box = new THREE.Mesh(
          makeRoundedBox(1.75, 1.1, 1.35, 0.14, 3),
          new THREE.MeshStandardMaterial({
            color: 0x1558c9,
            roughness: 0.28,
            metalness: 0.08,
          }),
        );
        box.position.y = -0.22;
        grp.add(box);

        const lid = new THREE.Mesh(
          makeRoundedBox(1.82, 0.22, 1.42, 0.07, 3),
          new THREE.MeshStandardMaterial({ color: 0x030407, roughness: 0.35 }),
        );
        lid.position.y = 0.38;
        grp.add(lid);

        // White cross on crate front
        const cross = makeCross(0.42, 0.12, 0.03, 0xffffff);
        cross.position.set(0, -0.22, 0.7);
        grp.add(cross);

        // Floating Acid Lime Arrow
        const arrowGrp = new THREE.Group();
        const arrowMat = new THREE.MeshStandardMaterial({
          color: 0xd4ff24,
          roughness: 0.22,
        });
        const stem = new THREE.Mesh(
          makeRoundedBox(0.28, 0.65, 0.22, 0.06, 2),
          arrowMat,
        );
        stem.position.y = 0.82;
        const head = new THREE.Mesh(
          new THREE.ConeGeometry(0.42, 0.52, 4),
          arrowMat,
        );
        head.position.y = 1.28;
        head.rotation.y = Math.PI / 4;
        arrowGrp.add(stem, head);
        grp.add(arrowGrp);

        scene.add(grp);
        miniAnim = (t) => {
          grp.rotation.y = 0.55 + Math.sin(t * 0.9) * 0.28;
          grp.rotation.x = 0.28;
          arrowGrp.position.y = Math.sin(t * 2.2) * 0.12 - 0.1;
        };
      } else if (kind === 'mini-trk') {
        const grp = new THREE.Group();

        // 3D Dispatch Medical Courier Crate
        const crateSubGrp = new THREE.Group();
        const cBox = new THREE.Mesh(
          makeRoundedBox(1.32, 0.76, 1.02, 0.1, 3),
          new THREE.MeshStandardMaterial({
            color: 0x1558c9,
            roughness: 0.26,
            metalness: 0.08,
          }),
        );
        cBox.position.y = -0.42;

        const cLid = new THREE.Mesh(
          makeRoundedBox(1.38, 0.16, 1.08, 0.05, 3),
          new THREE.MeshStandardMaterial({
            color: 0xf4f7fc,
            roughness: 0.3,
          }),
        );
        cLid.position.y = 0.02;

        const cCross = makeCross(0.34, 0.1, 0.03, 0xd4ff24);
        cCross.position.set(0, -0.42, 0.53);

        crateSubGrp.add(cBox, cLid, cCross);
        grp.add(crateSubGrp);

        // Hovering Acid Lime GPS Beacon Pin
        const pinGrp = new THREE.Group();
        const limeMat = new THREE.MeshStandardMaterial({
          color: 0xd4ff24,
          roughness: 0.18,
          metalness: 0.06,
        });
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.48, 22, 22),
          limeMat,
        );
        head.position.y = 0.74;
        const tip = new THREE.Mesh(
          new THREE.ConeGeometry(0.36, 0.68, 22),
          limeMat,
        );
        tip.position.y = 0.34;
        tip.rotation.x = Math.PI;
        const core = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 1.04, 18),
          new THREE.MeshStandardMaterial({ color: 0x030407, roughness: 0.3 }),
        );
        core.rotation.x = Math.PI / 2;
        core.position.y = 0.74;
        pinGrp.add(head, tip, core);
        grp.add(pinGrp);

        // Pulsating Radar Rings
        const ring1 = new THREE.Mesh(
          new THREE.TorusGeometry(0.92, 0.05, 12, 32),
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.65,
          }),
        );
        ring1.rotation.x = Math.PI / 2;
        ring1.position.y = -0.84;
        grp.add(ring1);

        const ring2 = new THREE.Mesh(
          new THREE.TorusGeometry(1.24, 0.045, 12, 32),
          new THREE.MeshBasicMaterial({
            color: 0xd4ff24,
            transparent: true,
            opacity: 0.55,
          }),
        );
        ring2.rotation.x = Math.PI / 2;
        ring2.position.y = -0.84;
        grp.add(ring2);

        scene.add(grp);
        miniAnim = (t) => {
          pinGrp.position.y = Math.sin(t * 2.3) * 0.11 + 0.06;
          pinGrp.rotation.y = Math.sin(t * 1.1) * 0.45;
          crateSubGrp.rotation.y = 0.38 + Math.sin(t * 0.9) * 0.24;
          grp.rotation.x = 0.22;
          const s = 1 + ((t * 0.7) % 1) * 0.32;
          ring2.scale.set(s, s, 1);
        };
      } else if (kind === 'drug') {
        rootGrp = new THREE.Group();

        // 1. ORS Sachet (Full procedural)
        const orsGrp = new THREE.Group();
        const bodyGeo = makeRoundedBox(1.85, 2.45, 0.28, 0.14, 4);
        const body = new THREE.Mesh(
          bodyGeo,
          new THREE.MeshStandardMaterial({
            color: 0xf8faff,
            roughness: 0.28,
            metalness: 0.16,
          }),
        );
        orsGrp.add(body);

        // Top & bottom crimp seals
        const crimpMat = new THREE.MeshStandardMaterial({
          color: 0xdde7f5,
          roughness: 0.35,
          metalness: 0.55,
        });
        const topCrimp = new THREE.Mesh(
          makeRoundedBox(1.9, 0.24, 0.3, 0.04, 2),
          crimpMat,
        );
        topCrimp.position.y = 1.18;
        const botCrimp = new THREE.Mesh(
          makeRoundedBox(1.9, 0.24, 0.3, 0.04, 2),
          crimpMat,
        );
        botCrimp.position.y = -1.18;
        orsGrp.add(topCrimp, botCrimp);

        // Cobalt brand label plate
        const labelPlate = new THREE.Mesh(
          makeRoundedBox(1.6, 1.48, 0.04, 0.06, 2),
          new THREE.MeshStandardMaterial({
            color: 0x1558c9,
            roughness: 0.25,
            metalness: 0.08,
          }),
        );
        labelPlate.position.z = 0.155;
        orsGrp.add(labelPlate);

        // 3D Acid Lime Medical Cross
        const cross = makeCross(0.65, 0.2, 0.05, 0xd4ff24);
        cross.position.set(0, 0.22, 0.19);
        orsGrp.add(cross);

        // Dosage plaque
        const dosage = new THREE.Mesh(
          makeRoundedBox(1.05, 0.24, 0.03, 0.04, 2),
          new THREE.MeshStandardMaterial({
            color: 0xd4ff24,
            roughness: 0.2,
          }),
        );
        dosage.position.set(0, -0.4, 0.18);
        orsGrp.add(dosage);

        // 2. Zinc Blister Pack (Full procedural)
        const zincGrp = new THREE.Group();
        const card = new THREE.Mesh(
          makeRoundedBox(2.65, 1.68, 0.08, 0.05, 4),
          new THREE.MeshStandardMaterial({
            color: 0xd8e3f4,
            roughness: 0.24,
            metalness: 0.68,
          }),
        );
        zincGrp.add(card);

        // 2x5 grid of blister bubbles with white zinc tablets inside
        const domeMat = new THREE.MeshStandardMaterial({
          color: 0xeaf2ff,
          roughness: 0.1,
          metalness: 0.15,
          transparent: true,
          opacity: 0.52,
        });
        const tabMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.22,
        });
        const tabGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 18);
        tabGeo.rotateX(Math.PI / 2);
        const domeGeo = new THREE.SphereGeometry(
          0.22,
          16,
          12,
          0,
          Math.PI * 2,
          0,
          Math.PI / 2,
        );
        domeGeo.rotateX(Math.PI / 2);
        const scoreMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e4 });

        for (let r = 0; r < 2; r++) {
          for (let col = 0; col < 5; col++) {
            const x = (col - 2) * 0.46;
            const y = r === 0 ? 0.42 : -0.42;
            const t = new THREE.Mesh(tabGeo, tabMat);
            t.position.set(x, y, 0.06);
            zincGrp.add(t);
            const sc = new THREE.Mesh(
              new THREE.BoxGeometry(0.24, 0.02, 0.02),
              scoreMat,
            );
            sc.position.set(x, y, 0.105);
            zincGrp.add(sc);
            const dm = new THREE.Mesh(domeGeo, domeMat);
            dm.position.set(x, y, 0.05);
            dm.scale.set(1, 1, 0.65);
            zincGrp.add(dm);
          }
        }

        // Zinc header stripe in Cobalt
        const zStripe = new THREE.Mesh(
          makeRoundedBox(2.5, 0.18, 0.02, 0.02, 2),
          new THREE.MeshStandardMaterial({ color: 0x1558c9, roughness: 0.3 }),
        );
        zStripe.position.set(0, 0.72, 0.05);
        zincGrp.add(zStripe);

        orsGrp.visible = stateRef.current.drug === 'ors';
        zincGrp.visible = stateRef.current.drug === 'zinc';
        stateRef.current.orsGrp = orsGrp;
        stateRef.current.zincGrp = zincGrp;

        rootGrp.add(orsGrp, zincGrp);
        scene.add(rootGrp);
      } else if (kind === 'crate') {
        rootGrp = new THREE.Group();
        const box = new THREE.Mesh(
          makeRoundedBox(2.25, 1.45, 1.65, 0.14, 4),
          new THREE.MeshStandardMaterial({
            color: 0x1558c9,
            roughness: 0.28,
            metalness: 0.06,
          }),
        );
        box.position.y = -0.08;
        rootGrp.add(box);

        const lid = new THREE.Mesh(
          makeRoundedBox(2.34, 0.28, 1.74, 0.09, 3),
          new THREE.MeshStandardMaterial({ color: 0x030407, roughness: 0.34 }),
        );
        lid.position.y = 0.68;
        rootGrp.add(lid);

        const handle = new THREE.Mesh(
          makeRoundedBox(0.75, 0.14, 0.24, 0.05, 3),
          new THREE.MeshStandardMaterial({ color: 0x1f2738, roughness: 0.4 }),
        );
        handle.position.y = 0.87;
        rootGrp.add(handle);

        const badge = new THREE.Mesh(
          makeRoundedBox(0.68, 0.68, 0.04, 0.03, 3),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22 }),
        );
        badge.position.set(-0.56, -0.08, 0.84);
        rootGrp.add(badge);

        const cross = makeCross(0.42, 0.13, 0.03, 0x1558c9);
        cross.position.set(-0.56, -0.08, 0.875);
        rootGrp.add(cross);

        // 3D Tamper-evident Seal Tag in Acid Lime
        const sealTag = new THREE.Mesh(
          makeRoundedBox(0.92, 0.52, 0.03, 0.04, 2),
          new THREE.MeshStandardMaterial({
            color: 0xd4ff24,
            roughness: 0.22,
          }),
        );
        sealTag.position.set(0.46, 0.32, 0.875);
        rootGrp.add(sealTag);

        const sealStripe = new THREE.Mesh(
          makeRoundedBox(0.72, 0.14, 0.03, 0.02, 2),
          new THREE.MeshStandardMaterial({ color: 0x030407, roughness: 0.3 }),
        );
        sealStripe.position.set(0.46, 0.32, 0.895);
        rootGrp.add(sealStripe);

        scene.add(rootGrp);
      }

      const t0 = Date.now();
      const animate = () => {
        stateRef.current.raf = requestAnimationFrame(animate);
        const t = (Date.now() - t0) / 1000;
        if (miniAnim) {
          miniAnim(t);
        } else if (rootGrp) {
          if (stateRef.current.orsGrp && stateRef.current.zincGrp) {
            stateRef.current.orsGrp.visible = stateRef.current.drug === 'ors';
            stateRef.current.zincGrp.visible = stateRef.current.drug === 'zinc';
          }
          if (!stateRef.current.dragging) {
            stateRef.current.targetY += 0.0045;
          }
          stateRef.current.rotX +=
            (stateRef.current.targetX - stateRef.current.rotX) * 0.1;
          stateRef.current.rotY +=
            (stateRef.current.targetY - stateRef.current.rotY) * 0.1;
          rootGrp.rotation.x = stateRef.current.rotX;
          rootGrp.rotation.y = stateRef.current.rotY;
          rootGrp.position.y = Math.sin(t * 1.5) * 0.04;
        }
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      animate();
    } catch (err) {
      console.warn('[Stage3D] WebGL error:', err);
    }
  };

  return (
    <View
      style={[
        {
          width: finalWidth,
          height,
          alignSelf: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
      {...(interactive ? panResponder.panHandlers : {})}
    >
      <GLView
        style={{ flex: 1, width: '100%', height: '100%' }}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}
