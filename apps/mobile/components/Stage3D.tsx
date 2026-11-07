import React, { useEffect, useRef } from 'react';
import {
  PanResponder,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import {
  getOrsTexture,
  getZincTexture,
  getSealTexture,
  getMiniOrsTexture,
} from '../lib/three/textures';

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

  useEffect(() => {
    stateRef.current.drug = drug;
    if (stateRef.current.orsGrp && stateRef.current.zincGrp) {
      stateRef.current.orsGrp.visible = drug === 'ors';
      stateRef.current.zincGrp.visible = drug === 'zinc';
      stateRef.current.targetX = 0.18;
      stateRef.current.targetY = -0.32;
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
    const renderer = new Renderer({ gl }) as unknown as THREE.WebGLRenderer;
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0);

    const isMini = kind.startsWith('mini-');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      isMini ? 32 : 30,
      gl.drawingBufferWidth / Math.max(1, gl.drawingBufferHeight),
      0.1,
      50,
    );
    camera.position.set(0, 0, isMini ? 5.1 : 6.4);

    scene.add(new THREE.AmbientLight(0xffffff, isMini ? 1.25 : 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(3, 5, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbfd4ff, 0.7);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    let rootGrp: THREE.Group | null = null;
    let miniAnim: ((t: number) => void) | null = null;

    if (kind === 'mini-req') {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        makeRoundedBox(1.45, 1.9, 0.28, 0.14, 3),
        new THREE.MeshStandardMaterial({
          color: 0xf4f7fc,
          roughness: 0.3,
          metalness: 0.08,
        }),
      );
      g.add(body);
      const face = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 1.62),
        new THREE.MeshStandardMaterial({
          map: getMiniOrsTexture(),
          roughness: 0.35,
        }),
      );
      face.position.z = 0.145;
      g.add(face);
      const tabGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.14, 20);
      tabGeo.rotateX(Math.PI / 2);
      const t1 = new THREE.Mesh(
        tabGeo,
        new THREE.MeshStandardMaterial({ color: 0xd4ff24, roughness: 0.25 }),
      );
      t1.position.set(0.82, -0.5, 0.45);
      t1.rotation.set(0.3, -0.4, 0.2);
      g.add(t1);
      const t2 = new THREE.Mesh(
        tabGeo,
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 }),
      );
      t2.position.set(-0.78, 0.48, 0.38);
      t2.rotation.set(-0.3, 0.4, -0.2);
      g.add(t2);
      scene.add(g);
      miniAnim = (t) => {
        g.rotation.y = Math.sin(t * 1.1) * 0.38 - 0.22;
        g.rotation.x = 0.14 + Math.cos(t * 0.9) * 0.08;
        g.position.y = Math.sin(t * 1.5) * 0.07;
      };
    } else if (kind === 'mini-rel') {
      const g = new THREE.Group();
      const box = new THREE.Mesh(
        makeRoundedBox(1.75, 1.1, 1.35, 0.14, 3),
        new THREE.MeshStandardMaterial({
          color: 0x1558c9,
          roughness: 0.28,
          metalness: 0.08,
        }),
      );
      box.position.y = -0.22;
      g.add(box);
      const lid = new THREE.Mesh(
        makeRoundedBox(1.82, 0.22, 1.42, 0.07, 3),
        new THREE.MeshStandardMaterial({ color: 0x030407, roughness: 0.35 }),
      );
      lid.position.y = 0.38;
      g.add(lid);
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
      g.add(arrowGrp);
      scene.add(g);
      miniAnim = (t) => {
        g.rotation.y = 0.55 + Math.sin(t * 0.9) * 0.28;
        g.rotation.x = 0.28;
        arrowGrp.position.y = Math.sin(t * 2.2) * 0.12 - 0.1;
      };
    } else if (kind === 'mini-trk') {
      const g = new THREE.Group();
      const pinGrp = new THREE.Group();
      const limeMat = new THREE.MeshStandardMaterial({
        color: 0xd4ff24,
        roughness: 0.2,
        metalness: 0.05,
      });
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.68, 22, 22),
        limeMat,
      );
      head.position.y = 0.38;
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.52, 0.95, 22),
        limeMat,
      );
      tip.position.y = -0.22;
      tip.rotation.x = Math.PI;
      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 1.4, 18),
        new THREE.MeshStandardMaterial({ color: 0x030407, roughness: 0.3 }),
      );
      core.rotation.x = Math.PI / 2;
      core.position.y = 0.38;
      pinGrp.add(head, tip, core);
      g.add(pinGrp);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.88, 0.06, 12, 32),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.55,
        }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.82;
      g.add(ring);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.22, 0.04, 12, 32),
        new THREE.MeshBasicMaterial({
          color: 0xd4ff24,
          transparent: true,
          opacity: 0.45,
        }),
      );
      ring2.rotation.x = Math.PI / 2;
      ring2.position.y = -0.82;
      g.add(ring2);

      scene.add(g);
      miniAnim = (t) => {
        pinGrp.position.y = Math.sin(t * 2.3) * 0.14 + 0.08;
        pinGrp.rotation.y = Math.sin(t * 1.1) * 0.45;
        g.rotation.x = 0.22;
        const s = 1 + ((t * 0.7) % 1) * 0.35;
        ring2.scale.set(s, s, 1);
      };
    } else if (kind === 'drug') {
      rootGrp = new THREE.Group();

      // ORS Sachet
      const orsGrp = new THREE.Group();
      const bodyGeo = makeRoundedBox(1.85, 2.45, 0.34, 0.14, 4);
      const pos = bodyGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const pillow =
          Math.cos((x / 0.95) * (Math.PI / 2)) *
          Math.cos((y / 1.25) * (Math.PI / 2));
        pos.setZ(i, z + Math.sign(z) * Math.max(0, pillow) * 0.12);
      }
      bodyGeo.computeVertexNormals();
      const body = new THREE.Mesh(
        bodyGeo,
        new THREE.MeshStandardMaterial({
          color: 0xf1f5fb,
          roughness: 0.3,
          metalness: 0.14,
        }),
      );
      orsGrp.add(body);

      const labelTex = getOrsTexture();
      const labelMat = new THREE.MeshStandardMaterial({
        map: labelTex,
        roughness: 0.36,
        metalness: 0.05,
      });
      const front = new THREE.Mesh(
        new THREE.PlaneGeometry(1.62, 2.22),
        labelMat,
      );
      front.position.z = 0.295;
      orsGrp.add(front);
      const back = new THREE.Mesh(
        new THREE.PlaneGeometry(1.62, 2.22),
        labelMat,
      );
      back.position.z = -0.295;
      back.rotation.y = Math.PI;
      orsGrp.add(back);

      // Zinc Blister Pack
      const zincGrp = new THREE.Group();
      const card = new THREE.Mesh(
        makeRoundedBox(2.55, 1.62, 0.08, 0.03, 4),
        new THREE.MeshStandardMaterial({
          color: 0xdbe3ef,
          roughness: 0.32,
          metalness: 0.38,
        }),
      );
      zincGrp.add(card);
      const zFace = new THREE.Mesh(
        new THREE.PlaneGeometry(2.38, 1.46),
        new THREE.MeshStandardMaterial({
          map: getZincTexture(),
          roughness: 0.35,
          metalness: 0.12,
        }),
      );
      zFace.position.z = 0.046;
      zincGrp.add(zFace);

      const tabMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.25,
      });
      const domeMat = new THREE.MeshStandardMaterial({
        color: 0xeaf2ff,
        roughness: 0.12,
        metalness: 0.1,
        transparent: true,
        opacity: 0.48,
      });
      const tabGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.08, 18);
      tabGeo.rotateX(Math.PI / 2);
      const domeGeo = new THREE.SphereGeometry(
        0.21,
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
          const x = (col - 2) * 0.44;
          const y = (r === 0 ? 0.15 : -0.3) - 0.05;
          const t = new THREE.Mesh(tabGeo, tabMat);
          t.position.set(x, y, 0.085);
          zincGrp.add(t);
          const sc = new THREE.Mesh(
            new THREE.BoxGeometry(0.26, 0.018, 0.02),
            scoreMat,
          );
          sc.position.set(x, y, 0.13);
          zincGrp.add(sc);
          const dm = new THREE.Mesh(domeGeo, domeMat);
          dm.position.set(x, y, 0.05);
          dm.scale.set(1, 1, 0.72);
          zincGrp.add(dm);
        }
      }

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

      const crossMat = new THREE.MeshStandardMaterial({
        color: 0x1558c9,
        roughness: 0.28,
      });
      const c1 = new THREE.Mesh(
        makeRoundedBox(0.4, 0.13, 0.03, 0.015, 2),
        crossMat,
      );
      c1.position.set(-0.56, -0.08, 0.875);
      const c2 = new THREE.Mesh(
        makeRoundedBox(0.13, 0.4, 0.03, 0.015, 2),
        crossMat,
      );
      c2.position.set(-0.56, -0.08, 0.875);
      rootGrp.add(c1, c2);

      const sealTag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 0.56),
        new THREE.MeshStandardMaterial({
          map: getSealTexture(),
          roughness: 0.3,
        }),
      );
      sealTag.position.set(0.46, 0.32, 0.855);
      rootGrp.add(sealTag);

      scene.add(rootGrp);
    }

    const t0 = Date.now();
    const animate = () => {
      stateRef.current.raf = requestAnimationFrame(animate);
      const t = (Date.now() - t0) / 1000;
      if (miniAnim) {
        miniAnim(t);
      } else if (rootGrp) {
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
  };

  return (
    <View
      style={[
        {
          width: width ?? '100%',
          height,
          overflow: 'hidden',
        },
        style,
      ]}
      {...(interactive ? panResponder.panHandlers : {})}
    >
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
}
