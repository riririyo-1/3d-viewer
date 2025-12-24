"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Asset } from "@/lib/store";

interface ViewerSettings {
  wireframe: boolean;
  autoRotate: boolean;
  showGrid: boolean;
}

interface ViewerCanvasProps {
  asset: Asset;
  settings: ViewerSettings;
}

export function ViewerCanvas({ asset, settings }: ViewerCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentObjectRef = useRef<THREE.Object3D | null>(null);
  const pedestalRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const frameIdRef = useRef<number | null>(null);

  const createGradientTexture = () => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Texture();

    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#f3f4f6");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = createGradientTexture();
    scene.fog = new THREE.Fog("#f3f4f6", 15, 60);
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(4.4, 3.5, 4.4);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTS
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    scene.add(new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.4));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 12, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    scene.add(mainLight);

    // PEDESTAL
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 0.1, 64),
      new THREE.MeshStandardMaterial({
        color: 0xd1d5db,
        roughness: 0.8,
        metalness: 0.5,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      })
    );
    pedestal.position.y = -0.05;
    pedestal.receiveShadow = true;
    scene.add(pedestal);
    pedestalRef.current = pedestal;

    // GRID
    const gridHelper = new THREE.GridHelper(100, 100, 0xd1d5db, 0xe5e7eb);
    gridHelper.position.y = -0.11;
    gridHelper.visible = settings.showGrid;
    scene.add(gridHelper);
    gridRef.current = gridHelper;

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotateSpeed = 0.6;
    controlsRef.current = controls;

    // ANIMATION LOOP
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (pedestalRef.current && cameraRef.current) {
        const material = pedestalRef.current.material;
        if (material && !Array.isArray(material)) {
          material.opacity = cameraRef.current.position.y < -0.1 ? 0.15 : 0.9;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // LOAD MODEL
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleModel = (obj: any) => {
      const target = asset.type === "obj" ? obj : obj.scene;

      const box = new THREE.Box3().setFromObject(target);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 2.8 / (Math.max(size.x, size.y, size.z) || 1);

      target.scale.set(scale, scale, scale);
      target.position.sub(center.multiplyScalar(scale));
      target.position.y += (size.y * scale) / 2;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target.traverse((c: any) => {
        if (c.isMesh) {
          if (asset.type === "obj") {
            c.material = new THREE.MeshStandardMaterial({
              color: 0x444444,
              roughness: 0.5,
              metalness: 0.1,
            });
          }
          c.castShadow = true;
          c.receiveShadow = true;

          const setWireframe = (material: any) => {
            material.wireframe = settings.wireframe;
          };

          if (Array.isArray(c.material)) {
            c.material.forEach(setWireframe);
          } else {
            setWireframe(c.material);
          }
        }
      });

      scene.add(target);
      currentObjectRef.current = target;
    };

    if (asset.type === "obj") {
      try {
        const loader = new OBJLoader();
        if (asset.url) {
          loader.load(asset.url, handleModel, undefined, (e) =>
            console.error("Failed to load OBJ from URL", e)
          );
        } else if (typeof asset.data === "string") {
          const result = loader.parse(asset.data);
          handleModel(result);
        }
      } catch (e) {
        console.error("Failed to load OBJ", e);
      }
    } else {
      try {
        console.log("Loading GLB/GLTF...");
        const loader = new GLTFLoader();
        if (asset.url) {
          loader.load(
            asset.url,
            (gltf) => {
              console.log("GLB Loaded from URL", gltf);
              handleModel(gltf);
            },
            undefined,
            (e) => console.error("Failed to load GLB from URL", e)
          );
        } else {
          loader.parse(
            asset.data,
            "",
            (gltf) => {
              console.log("GLB Loaded", gltf);
              handleModel(gltf);
            },
            (err: unknown) => console.error("GLB Load Error", err)
          );
        }
      } catch (e) {
        console.error("Failed to load GLB", e);
      }
    }

    // RESIZE
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const mount = mountRef.current;
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);

      // Cleanup Three.js resources
      renderer.dispose();
    };
  }, [asset]); // Re-init on asset change

  // Update settings without re-init
  useEffect(() => {
    if (controlsRef.current)
      controlsRef.current.autoRotate = settings.autoRotate;
    if (gridRef.current) gridRef.current.visible = settings.showGrid;
    if (currentObjectRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentObjectRef.current.traverse((c: any) => {
        if (c.isMesh && c.material) {
          if (Array.isArray(c.material)) {
            c.material.forEach((m: any) => {
              m.wireframe = settings.wireframe;
            });
          } else {
            c.material.wireframe = settings.wireframe;
          }
        }
      });
    }
  }, [settings]);

  return <div ref={mountRef} className="w-full h-full" />;
}
