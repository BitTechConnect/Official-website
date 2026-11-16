import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useTheme } from '../context/ThemeContext';

const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function buildCyberTreeGroup(
  trunkMat: THREE.Material,
  canopyMat: THREE.Material,
  wireMatGreen: THREE.LineBasicMaterial,
  wireMatBlue: THREE.LineBasicMaterial,
  wireMatViolet: THREE.LineBasicMaterial,
): THREE.Group {
  const tree = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.44, 4.4, 8);
  trunkGeo.translate(0, 2.2, 0);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  tree.add(trunk);

  const rootRingGeo = new THREE.TorusGeometry(0.82, 0.03, 8, 36);
  rootRingGeo.rotateX(Math.PI / 2);
  const rootRing = new THREE.Mesh(rootRingGeo, canopyMat);
  rootRing.position.y = 0.05;
  tree.add(rootRing);

  const branchSpecs = [
    { angleY: 0.3, tiltZ: 0.58, height: 2.3, y: 2.5, radius: 0.095 },
    { angleY: 1.7, tiltZ: -0.62, height: 2.1, y: 2.8, radius: 0.088 },
    { angleY: 3.1, tiltZ: 0.52, height: 1.95, y: 3.1, radius: 0.082 },
    { angleY: 4.5, tiltZ: -0.48, height: 1.85, y: 3.4, radius: 0.078 },
    { angleY: 5.6, tiltZ: 0.42, height: 1.65, y: 3.7, radius: 0.072 },
  ];

  branchSpecs.forEach((b, idx) => {
    const branchHolder = new THREE.Group();
    branchHolder.position.set(0, b.y, 0);
    branchHolder.rotation.y = b.angleY;

    const branchGeo = new THREE.CylinderGeometry(b.radius * 0.45, b.radius, b.height, 6);
    branchGeo.translate(0, b.height / 2, 0);
    const branchMesh = new THREE.Mesh(branchGeo, trunkMat);
    branchMesh.rotation.z = b.tiltZ;
    branchHolder.add(branchMesh);

    const tipX = -Math.sin(b.tiltZ) * b.height;
    const tipY = Math.cos(b.tiltZ) * b.height;
    const podGeo = new THREE.IcosahedronGeometry(0.75 + idx * 0.05, 0);
    const pod = new THREE.Mesh(podGeo, canopyMat);
    pod.position.set(tipX, tipY, 0);
    branchHolder.add(pod);

    const edges = new THREE.EdgesGeometry(podGeo, 15);
    const wireMat = idx % 3 === 0 ? wireMatGreen : idx % 3 === 1 ? wireMatBlue : wireMatViolet;
    const wire = new THREE.LineSegments(edges, wireMat);
    wire.position.copy(pod.position);
    wire.scale.setScalar(1.09);
    branchHolder.add(wire);

    tree.add(branchHolder);
  });

  const crownGeo = new THREE.OctahedronGeometry(1.22, 1);
  const crown = new THREE.Mesh(crownGeo, canopyMat);
  crown.position.set(0, 4.9, 0);
  tree.add(crown);

  const crownEdges = new THREE.EdgesGeometry(crownGeo, 15);
  const crownWire = new THREE.LineSegments(crownEdges, wireMatGreen);
  crownWire.position.copy(crown.position);
  crownWire.scale.setScalar(1.12);
  tree.add(crownWire);

  return tree;
}

function buildHolographicOrbCore(
  coreMat: THREE.Material,
  wireGreen: THREE.LineBasicMaterial,
  wireBlue: THREE.LineBasicMaterial,
  wireViolet: THREE.LineBasicMaterial,
): THREE.Group {
  const core = new THREE.Group();

  const innerGeo = new THREE.IcosahedronGeometry(1.38, 1);
  const innerMesh = new THREE.Mesh(innerGeo, coreMat);
  core.add(innerMesh);

  const innerWire = new THREE.LineSegments(new THREE.EdgesGeometry(innerGeo, 10), wireGreen);
  innerWire.scale.setScalar(1.08);
  core.add(innerWire);

  const outerGeo = new THREE.IcosahedronGeometry(2.25, 1);
  const outerWire = new THREE.LineSegments(new THREE.EdgesGeometry(outerGeo, 10), wireBlue);
  core.add(outerWire);

  const ring1Geo = new THREE.TorusGeometry(2.8, 0.032, 10, 76);
  const ring1 = new THREE.Mesh(ring1Geo, wireGreen);
  ring1.rotation.set(Math.PI / 3, 0.4, 0);
  core.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(3.25, 0.025, 10, 88);
  const ring2 = new THREE.Mesh(ring2Geo, wireBlue);
  ring2.rotation.set(-Math.PI / 4, -0.5, 0.2);
  core.add(ring2);

  const ring3Geo = new THREE.TorusGeometry(3.65, 0.018, 10, 96);
  const ring3 = new THREE.Mesh(ring3Geo, wireViolet);
  ring3.rotation.set(0.18, Math.PI / 2.4, -0.35);
  core.add(ring3);

  return core;
}

export function CyberNatureCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const [webglFailed, setWebglFailed] = useState(false);

  const sceneRefs = useRef<{
    particleMat?: THREE.ShaderMaterial;
    streamMat?: THREE.ShaderMaterial;
    lineMat?: THREE.LineBasicMaterial;
    ambientLight?: THREE.HemisphereLight;
  }>({});

  useEffect(() => {
    const refs = sceneRefs.current;
    const isDark = theme === 'dark';

    // CRITICAL: AdditiveBlending washes out on light backgrounds, whereas NormalBlending stays vivid & bold!
    if (refs.particleMat) {
      refs.particleMat.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      refs.particleMat.uniforms.uOpacity.value = isDark ? 0.98 : 0.94;
      refs.particleMat.uniforms.uLightBoost.value = isDark ? 0.0 : 0.25;
      refs.particleMat.needsUpdate = true;
    }
    if (refs.streamMat) {
      refs.streamMat.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      refs.streamMat.uniforms.uOpacity.value = isDark ? 0.96 : 0.90;
      refs.streamMat.uniforms.uLightBoost.value = isDark ? 0.0 : 0.25;
      refs.streamMat.needsUpdate = true;
    }
    if (refs.lineMat) {
      refs.lineMat.opacity = isDark ? 0.48 : 0.44;
    }
    if (refs.ambientLight) {
      refs.ambientLight.intensity = isDark ? 1.15 : 1.45;
    }
  }, [theme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const isMobile = window.innerWidth < 768;
    const isSoftwareGl = detectSoftwareWebGL();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const isDarkInit = themeRef.current === 'dark';

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 180);
    camera.position.set(0, 1.8, 15.0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x16a34a, isDarkInit ? 1.1 : 1.4);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.position.set(10, 14, 12);
    scene.add(keyLight);

    const greenLight = new THREE.PointLight(0x22c55e, 24, 34);
    greenLight.position.set(-7, 2, 4);
    scene.add(greenLight);

    const blueLight = new THREE.PointLight(0x2563eb, 24, 34);
    blueLight.position.set(7, 3, 4);
    scene.add(blueLight);

    const violetLight = new THREE.PointLight(0xa855f7, 20, 32);
    violetLight.position.set(0, -4, 3);
    scene.add(violetLight);

    // Vivid 6-color Cyber-Nature Palette
    const palette = [
      new THREE.Color(0x16a34a), // Brand Green
      new THREE.Color(0x22c55e), // Neon Mint Green
      new THREE.Color(0x06b6d4), // Electric Cyan
      new THREE.Color(0x2563eb), // Brand Cobalt Blue
      new THREE.Color(0x8b5cf6), // Cyber Ultraviolet
      new THREE.Color(0x14b8a6), // Bioluminescent Teal
    ];

    // 1. Dense Multi-Color Interactive Particles (Swirling 3D Cloud)
    const particleCount = isMobile ? 1050 : 2600;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 44;
      const y = (Math.random() - 0.5) * 32;
      const z = (Math.random() - 0.5) * 30 - 2;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      scales[i] = 0.85 + Math.random() * 1.9;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    particleGeo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    const particleMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: isDarkInit ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2) },
        uOpacity: { value: isDarkInit ? 0.98 : 0.94 },
        uLightBoost: { value: isDarkInit ? 0.0 : 0.25 },
      },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aScale;
        varying vec3 vColor;
        uniform float uPixelRatio;

        void main() {
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aScale * 42.0 * uPixelRatio * (1.0 / max(1.0, -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float uOpacity;
        uniform float uLightBoost;

        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.04, dist) * uOpacity;
          vec3 finalCol = mix(vColor, vColor * 0.72, uLightBoost);
          gl_FragColor = vec4(finalCol, alpha);
        }
      `,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 2. Continuous Flowing Energy Embers (Visible Upward & Forward Motion)
    const streamCount = isMobile ? 350 : 900;
    const streamGeo = new THREE.BufferGeometry();
    const streamPos = new Float32Array(streamCount * 3);
    const streamColors = new Float32Array(streamCount * 3);
    const streamScales = new Float32Array(streamCount);
    const streamSpeeds = new Float32Array(streamCount);

    for (let i = 0; i < streamCount; i++) {
      streamPos[i * 3] = (Math.random() - 0.5) * 34;
      streamPos[i * 3 + 1] = (Math.random() - 0.5) * 26;
      streamPos[i * 3 + 2] = (Math.random() - 0.5) * 22;

      const c = palette[(i * 2 + 1) % palette.length];
      streamColors[i * 3] = c.r;
      streamColors[i * 3 + 1] = c.g;
      streamColors[i * 3 + 2] = c.b;
      streamScales[i] = 1.2 + Math.random() * 2.4;
      streamSpeeds[i] = 0.8 + Math.random() * 1.9;
    }

    streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPos, 3));
    streamGeo.setAttribute('aColor', new THREE.BufferAttribute(streamColors, 3));
    streamGeo.setAttribute('aScale', new THREE.BufferAttribute(streamScales, 1));

    const streamMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: isDarkInit ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uPixelRatio: { value: isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2) },
        uOpacity: { value: isDarkInit ? 0.96 : 0.90 },
        uLightBoost: { value: isDarkInit ? 0.0 : 0.25 },
      },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aScale;
        varying vec3 vColor;
        uniform float uPixelRatio;

        void main() {
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aScale * 50.0 * uPixelRatio * (1.0 / max(1.0, -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float uOpacity;
        uniform float uLightBoost;

        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          float core = smoothstep(0.25, 0.0, dist);
          float halo = smoothstep(0.5, 0.05, dist) * 0.65;
          float alpha = clamp((core + halo) * uOpacity, 0.0, 1.0);
          vec3 finalCol = mix(vColor, vColor * 0.68, uLightBoost);
          gl_FragColor = vec4(finalCol, alpha);
        }
      `,
    });

    const streamParticles = new THREE.Points(streamGeo, streamMat);
    scene.add(streamParticles);

    // 3. Materials for Digital Cyber-Trees & Holographic Cores
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.52,
      metalness: 0.58,
    });
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      emissive: 0x10b981,
      emissiveIntensity: 0.78,
      roughness: 0.22,
      metalness: 0.72,
      transparent: true,
      opacity: 0.82,
    });
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x2563eb,
      emissiveIntensity: 0.72,
      roughness: 0.16,
      metalness: 0.88,
      transparent: true,
      opacity: 0.58,
    });
    const wireMatGreen = new THREE.LineBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.85,
    });
    const wireMatBlue = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const wireMatViolet = new THREE.LineBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.78,
    });

    // Two Holographic Orbital Cores prominently framed inside the hero & scroll scene
    const holoCoreTop = buildHolographicOrbCore(coreMat, wireMatGreen, wireMatBlue, wireMatViolet);
    holoCoreTop.position.set(-0.3, 1.4, -2.5);
    holoCoreTop.scale.setScalar(1.05);
    scene.add(holoCoreTop);

    const holoCoreDeep = buildHolographicOrbCore(coreMat, wireMatViolet, wireMatGreen, wireMatBlue);
    holoCoreDeep.position.set(-4.6, -4.4, -4.5);
    holoCoreDeep.scale.setScalar(0.95);
    scene.add(holoCoreDeep);

    // 4 Cyber-Trees framing left, right, and deep horizon visibly inside viewport
    const treeLeft = buildCyberTreeGroup(trunkMat, canopyMat, wireMatGreen, wireMatBlue, wireMatViolet);
    treeLeft.position.set(-6.4, -4.0, -3.2);
    treeLeft.scale.setScalar(1.18);
    scene.add(treeLeft);

    const treeRight = buildCyberTreeGroup(trunkMat, canopyMat, wireMatGreen, wireMatBlue, wireMatViolet);
    treeRight.position.set(6.8, -4.2, -4.2);
    treeRight.rotation.y = 1.9;
    treeRight.scale.setScalar(1.22);
    scene.add(treeRight);

    const treeMidLeft = buildCyberTreeGroup(trunkMat, canopyMat, wireMatGreen, wireMatBlue, wireMatViolet);
    treeMidLeft.position.set(-11.5, -7.8, -9.5);
    treeMidLeft.rotation.y = 0.8;
    treeMidLeft.scale.setScalar(1.05);
    scene.add(treeMidLeft);

    const treeMidRight = buildCyberTreeGroup(trunkMat, canopyMat, wireMatGreen, wireMatBlue, wireMatViolet);
    treeMidRight.position.set(11.0, -8.2, -10.5);
    treeMidRight.rotation.y = 2.7;
    treeMidRight.scale.setScalar(1.1);
    scene.add(treeMidRight);

    // 4. Floating Multi-Color Crystal Polyhedra + Neural Network Connections
    const networkNodeCount = isMobile ? 22 : 44;
    const nodePositions: THREE.Vector3[] = [];
    const nodeVelocities: THREE.Vector3[] = [];
    const polyGeo = new THREE.OctahedronGeometry(0.32, 0);
    const polyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.65,
      roughness: 0.16,
      metalness: 0.88,
    });
    const polyInstanced = new THREE.InstancedMesh(polyGeo, polyMat, networkNodeCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < networkNodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 16 - 1.0,
        (Math.random() - 0.5) * 13 - 2.0,
      );
      nodePositions.push(pos);
      nodeVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.52,
          (Math.random() - 0.5) * 0.36,
          (Math.random() - 0.5) * 0.32,
        ),
      );
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.65 + Math.random() * 0.9);
      dummy.updateMatrix();
      polyInstanced.setMatrixAt(i, dummy.matrix);
      polyInstanced.setColorAt(i, palette[i % palette.length]);
    }
    polyInstanced.instanceMatrix.needsUpdate = true;
    if (polyInstanced.instanceColor) polyInstanced.instanceColor.needsUpdate = true;
    polyInstanced.frustumCulled = false;
    scene.add(polyInstanced);

    const maxSegments = networkNodeCount * networkNodeCount;
    const linePositions = new Float32Array(maxSegments * 6);
    const lineColors = new Float32Array(maxSegments * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: isDarkInit ? 0.42 : 0.34,
    });
    const networkLines = new THREE.LineSegments(lineGeo, lineMat);
    networkLines.frustumCulled = false;
    scene.add(networkLines);

    sceneRefs.current = {
      particleMat,
      streamMat,
      lineMat,
      ambientLight: hemiLight,
    };

    let pointerX = 0;
    let pointerY = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let scrollFactor = 0;

    const onPointerMove = (e: PointerEvent) => {
      targetPointerX = (e.clientX / window.innerWidth) * 2 - 1;
      targetPointerY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollFactor = Math.min(1, window.scrollY / maxScroll);
    };

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    };

    const onContextLost = (e: Event) => e.preventDefault();
    const onContextRestored = () => renderer.render(scene, camera);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function updateScene(delta: number, elapsed: number) {
      pointerX = THREE.MathUtils.damp(pointerX, targetPointerX, 4.5, delta);
      pointerY = THREE.MathUtils.damp(pointerY, targetPointerY, 4.5, delta);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, pointerX * 2.0, 3.2, delta);
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        1.8 + pointerY * 1.1 - scrollFactor * 5.2,
        3.2,
        delta,
      );
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 15.0 - scrollFactor * 3.2, 3.0, delta);
      camera.lookAt(0, -scrollFactor * 3.8, -3.0);

      holoCoreTop.rotation.y = elapsed * 0.32 + pointerX * 0.45;
      holoCoreTop.rotation.x = Math.sin(elapsed * 0.25) * 0.28 + pointerY * 0.32;
      holoCoreTop.position.y = 1.4 + Math.sin(elapsed * 0.7) * 0.28 - scrollFactor * 2.2;

      holoCoreDeep.rotation.y = -elapsed * 0.26 + pointerX * 0.3;
      holoCoreDeep.rotation.z = Math.cos(elapsed * 0.22) * 0.25;

      treeLeft.rotation.y = 0.2 + Math.sin(elapsed * 0.28) * 0.12;
      treeRight.rotation.y = 1.9 - Math.cos(elapsed * 0.25) * 0.12;

      // Cloud particle flow + cursor vortex repulsion
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const pxWorld = pointerX * 15;
      const pyWorld = pointerY * 9 - scrollFactor * 4.5;

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const bx = basePositions[ix];
        const by = basePositions[ix + 1];
        const bz = basePositions[ix + 2];

        let nx = bx + Math.sin(elapsed * 0.45 + by * 0.25) * 0.65;
        let ny = by + Math.cos(elapsed * 0.35 + bx * 0.22) * 0.55;
        const nz = bz + Math.sin(elapsed * 0.28 + i * 0.01) * 0.5;

        const dx = nx - pxWorld;
        const dy = ny - pyWorld;
        const distSq = dx * dx + dy * dy;
        if (distSq < 24 && distSq > 0.001) {
          const force = (1 - distSq / 24) * 1.45;
          const invDist = 1 / Math.sqrt(distSq);
          nx += dx * invDist * force;
          ny += dy * invDist * force;
        }

        posArr[ix] = nx;
        posArr[ix + 1] = ny;
        posArr[ix + 2] = nz;
      }
      posAttr.needsUpdate = true;
      particleMat.uniforms.uTime.value = elapsed;

      // Continuous rising & swirling ember stream
      const sAttr = streamGeo.attributes.position as THREE.BufferAttribute;
      const sArr = sAttr.array as Float32Array;
      for (let i = 0; i < streamCount; i++) {
        const ix = i * 3;
        const speed = streamSpeeds[i];
        sArr[ix] += Math.sin(elapsed * 0.7 + i) * delta * 0.35;
        sArr[ix + 1] += speed * delta;
        sArr[ix + 2] += Math.cos(elapsed * 0.5 + i) * delta * 0.25;
        if (sArr[ix + 1] > 14) {
          sArr[ix + 1] = -14;
          sArr[ix] = (Math.random() - 0.5) * 34;
        }
      }
      sAttr.needsUpdate = true;

      // Polyhedra + dynamic multi-color network web
      let segCount = 0;
      const linePosArr = lineGeo.attributes.position.array as Float32Array;
      const lineColArr = lineGeo.attributes.color.array as Float32Array;

      for (let i = 0; i < networkNodeCount; i++) {
        const p = nodePositions[i];
        const v = nodeVelocities[i];
        p.addScaledVector(v, delta);
        if (Math.abs(p.x) > 13) v.x *= -1;
        if (p.y > 7 || p.y < -9) v.y *= -1;
        if (p.z > 4 || p.z < -9) v.z *= -1;

        dummy.position.copy(p);
        dummy.rotation.set(elapsed * 0.52 + i, elapsed * 0.36 + i, 0);
        dummy.scale.setScalar(0.85 + 0.18 * Math.sin(elapsed * 1.2 + i));
        dummy.updateMatrix();
        polyInstanced.setMatrixAt(i, dummy.matrix);

        const colA = palette[i % palette.length];
        for (let j = i + 1; j < networkNodeCount; j++) {
          const q = nodePositions[j];
          _vec3A.copy(p);
          _vec3B.copy(q);
          if (_vec3A.distanceToSquared(_vec3B) < 30) {
            const colB = palette[j % palette.length];
            const offset = segCount * 6;
            linePosArr[offset] = p.x;
            linePosArr[offset + 1] = p.y;
            linePosArr[offset + 2] = p.z;
            linePosArr[offset + 3] = q.x;
            linePosArr[offset + 4] = q.y;
            linePosArr[offset + 5] = q.z;

            lineColArr[offset] = colA.r;
            lineColArr[offset + 1] = colA.g;
            lineColArr[offset + 2] = colA.b;
            lineColArr[offset + 3] = colB.r;
            lineColArr[offset + 4] = colB.g;
            lineColArr[offset + 5] = colB.b;
            segCount++;
          }
        }
      }
      polyInstanced.instanceMatrix.needsUpdate = true;
      lineGeo.setDrawRange(0, segCount * 2);
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;
    }

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      updateScene(delta, elapsed);
      renderer.render(scene, camera);

      if (reducedMotion) return;
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    updateScene(0.016, 0);
    renderer.render(scene, camera);
    if (!reducedMotion) {
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      particleGeo.dispose();
      particleMat.dispose();
      streamGeo.dispose();
      streamMat.dispose();
      polyGeo.dispose();
      polyMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      trunkMat.dispose();
      canopyMat.dispose();
      coreMat.dispose();
      wireMatGreen.dispose();
      wireMatBlue.dispose();
      wireMatViolet.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      {/* Fixed multi-color Aurora atmosphere layer visible in BOTH Light and Dark mode */}
      <div
        aria-hidden="true"
        className="cyber-aurora-backdrop fixed inset-0 -z-20 pointer-events-none"
      />
      {/* Animated floating color glow orbs */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-[15] pointer-events-none overflow-hidden"
      >
        <div className="cyber-aurora-blob absolute -top-24 -left-24 h-[460px] w-[460px] rounded-full bg-[#16A34A]/20 dark:bg-[#16A34A]/25 blur-[110px]" />
        <div className="cyber-aurora-blob absolute top-1/3 -right-24 h-[520px] w-[520px] rounded-full bg-[#06B6D4]/22 dark:bg-[#2563EB]/26 blur-[120px]" />
        <div className="cyber-aurora-blob absolute -bottom-24 left-1/3 h-[440px] w-[440px] rounded-full bg-[#7C3AED]/18 dark:bg-[#7C3AED]/22 blur-[120px]" />
      </div>

      {!webglFailed && (
        <div
          ref={mountRef}
          aria-hidden="true"
          className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
        />
      )}
    </>
  );
}
