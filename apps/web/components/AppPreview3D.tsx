'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { contactShadow, makeEnvironment, roundedBox } from '../lib/three/kit';

export const PREVIEW_SCREENS = [
  {
    id: 'home',
    label: 'Home',
    src: '/preview/home.png',
    caption: 'Every active transfer, safety floor, and handover in one view.',
  },
  {
    id: 'request',
    label: 'Request',
    src: '/preview/request.png',
    caption:
      'Facility teams request ORS or zinc against a confirmed stock view.',
  },
  {
    id: 'release',
    label: 'Release',
    src: '/preview/release.png',
    caption:
      'The source custodian confirms stock, batch, and expiry before release.',
  },
  {
    id: 'handover',
    label: 'Handover',
    src: '/preview/handover.png',
    caption: 'Rider and facility both confirm the handover code and seal.',
  },
  {
    id: 'activity',
    label: 'Activity',
    src: '/preview/activity.png',
    caption:
      'A readable ledger of requests, releases, and confirmed deliveries.',
  },
] as const;

const PHONE = { w: 2.24, h: 4.72, d: 0.24, r: 0.3 };
const SCREEN = { w: 1.95, h: 4.38 };

function makeSheenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(0.32, 'rgba(255,255,255,0.12)');
  gradient.addColorStop(0.52, 'rgba(255,255,255,0)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function AppPreview3D() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const setScreenRef = useRef<((index: number) => void) | null>(null);
  const [active, setActive] = useState(0);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setSupported(false);
      return;
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth || 480, host.clientHeight || 620, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = 'app-preview-canvas-el';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      30,
      (host.clientWidth || 480) / Math.max(1, host.clientHeight || 620),
      0.1,
      60,
    );
    camera.position.set(0, 0.15, 8.4);
    camera.lookAt(0, 0, 0);

    const env = makeEnvironment(renderer);
    if (env) scene.environment = env;

    scene.add(new THREE.AmbientLight(0xffffff, 1.05));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(3.4, 5.2, 5.6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd4ff24, 1.15);
    rim.position.set(-4.6, -1.4, -2.8);
    scene.add(rim);
    const fill = new THREE.PointLight(0x1558c9, 14, 14, 2);
    fill.position.set(-2.4, 1.6, 3.4);
    scene.add(fill);

    const phone = new THREE.Group();
    phone.rotation.set(0.08, -0.32, 0.03);
    scene.add(phone);

    const bodyGeometry = roundedBox(PHONE.w, PHONE.h, PHONE.d, PHONE.r, 0.055);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x090c14,
      roughness: 0.34,
      metalness: 0.62,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.25,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    phone.add(body);

    const bezelGeometry = new THREE.PlaneGeometry(
      SCREEN.w + 0.12,
      SCREEN.h + 0.12,
    );
    const bezelMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x020306,
      roughness: 0.22,
      metalness: 0.35,
    });
    const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
    bezel.position.z = PHONE.d / 2 + 0.003;
    phone.add(bezel);

    const screenGeometry = new THREE.PlaneGeometry(SCREEN.w, SCREEN.h);
    const screenMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = PHONE.d / 2 + 0.006;
    phone.add(screen);

    const sheenTexture = makeSheenTexture();
    const sheenMaterial = new THREE.MeshBasicMaterial({
      map: sheenTexture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const sheen = new THREE.Mesh(screenGeometry.clone(), sheenMaterial);
    sheen.position.z = PHONE.d / 2 + 0.008;
    phone.add(sheen);

    const islandGeometry = roundedBox(0.62, 0.17, 0.014, 0.085, 0.006);
    const islandMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      roughness: 0.4,
      metalness: 0.2,
    });
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.set(0, SCREEN.h / 2 - 0.18, PHONE.d / 2 + 0.014);
    phone.add(island);

    const buttonMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1f2b,
      roughness: 0.28,
      metalness: 0.72,
    });
    const buttonGeometries: THREE.BufferGeometry[] = [];
    const addButton = (x: number, y: number, h: number) => {
      const geometry = roundedBox(0.045, h, 0.09, 0.02, 0.008);
      buttonGeometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, buttonMaterial);
      mesh.position.set(x, y, 0);
      phone.add(mesh);
    };
    addButton(-PHONE.w / 2 - 0.012, 0.62, 0.46);
    addButton(-PHONE.w / 2 - 0.012, -0.02, 0.46);
    addButton(PHONE.w / 2 + 0.012, 0.5, 0.7);

    const shadow = contactShadow(-2.78, 5.4);
    shadow.position.z = -0.2;
    scene.add(shadow);

    const loader = new THREE.TextureLoader();
    const textures: (THREE.Texture | null)[] = PREVIEW_SCREENS.map(() => null);
    let disposed = false;

    const setTexture = (index: number) => {
      const texture = textures[index];
      if (!texture) return;
      screenMaterial.map = texture;
      screenMaterial.needsUpdate = true;
    };

    let desired = 0;

    PREVIEW_SCREENS.forEach((item, index) => {
      loader.load(
        item.src,
        (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(
            8,
            renderer.capabilities.getMaxAnisotropy(),
          );
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = true;
          textures[index] = texture;
          if (desired === index) setTexture(index);
        },
        undefined,
        () => {
          // A failed texture leaves the previous screen in place.
        },
      );
    });

    let targetRotY = -0.32;
    let targetRotX = 0.08;
    let currentRotY = targetRotY;
    let currentRotX = targetRotX;
    let dragging = false;
    let pointerX = 0;
    let pointerY = 0;
    let lastX = 0;
    let lastY = 0;
    let hoverX = 0;
    let hoverY = 0;
    let flip = 1;
    let pendingScreen: number | null = null;
    let flipProgress = 0;

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      host.setPointerCapture(event.pointerId);
      host.classList.add('is-dragging');
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;

      if (dragging) {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        targetRotY = THREE.MathUtils.clamp(targetRotY + dx * 0.008, -1.2, 1.2);
        targetRotX = THREE.MathUtils.clamp(
          targetRotX + dy * 0.006,
          -0.55,
          0.55,
        );
        return;
      }

      hoverX = (pointerX / Math.max(1, rect.width)) * 2 - 1;
      hoverY = (pointerY / Math.max(1, rect.height)) * 2 - 1;
    };

    const release = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      host.classList.remove('is-dragging');
      if (host.hasPointerCapture(event.pointerId)) {
        host.releasePointerCapture(event.pointerId);
      }
    };

    const onPointerLeave = () => {
      hoverX = 0;
      hoverY = 0;
    };

    host.addEventListener('pointerdown', onPointerDown);
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerup', release);
    host.addEventListener('pointercancel', release);
    host.addEventListener('pointerleave', onPointerLeave);

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 420 ? 9.4 : 8.4;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const clock = new THREE.Clock();
    let frame = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (flipProgress > 0) {
        flipProgress = Math.min(1, flipProgress + 0.11);
        const eased = 1 - Math.pow(1 - flipProgress, 3);
        flip = Math.abs(Math.cos(Math.PI * eased));
        if (pendingScreen !== null && flipProgress >= 0.5) {
          setTexture(pendingScreen);
          pendingScreen = null;
        }
        if (flipProgress >= 1) {
          flip = 1;
          flipProgress = 0;
        }
      }

      if (!reduceMotion && !dragging) {
        const idle = Math.sin(t * 0.45) * 0.1;
        const hoverTarget = hoverX * 0.22;
        const hoverTargetX = hoverY * 0.14;
        currentRotY += (-0.32 + idle + hoverTarget - currentRotY) * 0.06;
        currentRotX += (0.08 - hoverTargetX - currentRotX) * 0.06;
      } else {
        currentRotY += (targetRotY - currentRotY) * 0.12;
        currentRotX += (targetRotX - currentRotX) * 0.12;
      }
      if (dragging) {
        currentRotY += (targetRotY - currentRotY) * 0.22;
        currentRotX += (targetRotX - currentRotX) * 0.22;
      }

      phone.rotation.y = currentRotY;
      phone.rotation.x = currentRotX;
      phone.position.y = reduceMotion ? 0 : Math.sin(t * 0.9) * 0.07;
      screen.scale.x = Math.max(0.001, flip);
      sheen.scale.x = Math.max(0.001, flip);

      renderer.render(scene, camera);
    };
    animate();

    setScreenRef.current = (index: number) => {
      desired = index;
      if (!textures[index]) return;
      pendingScreen = index;
      flipProgress = 0.001;
    };

    return () => {
      disposed = true;
      setScreenRef.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', release);
      host.removeEventListener('pointercancel', release);
      host.removeEventListener('pointerleave', onPointerLeave);
      host.classList.remove('is-dragging');

      textures.forEach((texture) => texture?.dispose());
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      bezelGeometry.dispose();
      bezelMaterial.dispose();
      screenGeometry.dispose();
      screenMaterial.dispose();
      sheenTexture?.dispose();
      sheenMaterial.dispose();
      islandGeometry.dispose();
      islandMaterial.dispose();
      buttonMaterial.dispose();
      buttonGeometries.forEach((geometry) => geometry.dispose());
      env?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    setScreenRef.current?.(active);
  }, [active]);

  const screen = PREVIEW_SCREENS[active] ?? PREVIEW_SCREENS[0];

  return (
    <div className="app-preview" data-screen={screen.id}>
      <div className="app-preview-stage">
        <span className="app-preview-glow" aria-hidden="true" />
        {supported ? (
          <div
            aria-label={`Interactive 3D preview of the Supplai app on the ${screen.label} screen`}
            className="app-preview-canvas"
            ref={hostRef}
            role="img"
          />
        ) : (
          <div className="app-preview-fallback">
            <img alt={`Supplai app ${screen.label} screen`} src={screen.src} />
          </div>
        )}
        <span className="app-preview-hint" aria-hidden="true">
          Drag to rotate
        </span>
      </div>

      <div className="app-preview-panel">
        <div
          aria-label="Preview app screens"
          className="app-preview-tabs"
          role="tablist"
        >
          {PREVIEW_SCREENS.map((item, index) => (
            <button
              aria-selected={index === active}
              className={
                index === active
                  ? 'app-preview-tab is-active'
                  : 'app-preview-tab'
              }
              key={item.id}
              onClick={() => setActive(index)}
              role="tab"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="app-preview-caption">
          <strong>{screen.label}</strong>
          {screen.caption}
        </p>
      </div>
    </div>
  );
}
