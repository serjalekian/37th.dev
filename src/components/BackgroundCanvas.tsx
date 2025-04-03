"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import vertexShader from "@/shaders/background.vert.glsl";
import fragmentShader from "@/shaders/background.frag.glsl";
import noiseVertexShader from "@/shaders/noise.vert.glsl";
import noiseFragmentShader from "@/shaders/noise.frag.glsl";
import NoiseControls from "./NoiseControls";
import { NoiseSettings } from "@/types/noise";

type CameraType = "perspective" | "orthographic";

// Default noise settings
const DEFAULT_NOISE_SETTINGS: NoiseSettings = {
  intensity: 0.037,
  scale: 37.0,
  speed: 0.0,
  distortion: 0.05,
};

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clockRef = useRef(new THREE.Clock());
  const [cameraType] = useState<CameraType>("orthographic");
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const perspectiveCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthographicCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const torusRef = useRef<THREE.Mesh | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const noisePassRef = useRef<ShaderPass | null>(null);
  const [noiseSettings, setNoiseSettings] = useState<NoiseSettings>(
    DEFAULT_NOISE_SETTINGS
  );

  function rotateTorus(mesh: THREE.Mesh, time: number) {
    mesh.rotation.y = -Math.sin(time * 0.037) * 3.3;
  }

  // Handler for noise settings changes
  const handleNoiseSettingsChange = useCallback(
    (newSettings: NoiseSettings) => {
      setNoiseSettings(newSettings);

      // Update noise pass uniforms if it exists
      if (noisePassRef.current && noisePassRef.current.uniforms) {
        noisePassRef.current.uniforms.uNoiseIntensity.value =
          newSettings.intensity;
        noisePassRef.current.uniforms.uNoiseScale.value = newSettings.scale;
        noisePassRef.current.uniforms.uNoiseSpeed.value = newSettings.speed;
        noisePassRef.current.uniforms.uDistortionAmount.value =
          newSettings.distortion;
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);
    sceneRef.current = scene;

    // Setup perspective camera
    const perspectiveCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    perspectiveCamera.position.z = 3;
    perspectiveCameraRef.current = perspectiveCamera;

    // Setup orthographic camera
    const aspect = window.innerWidth / window.innerHeight;
    const orthographicCamera = new THREE.OrthographicCamera(
      -aspect * 2,
      aspect * 2,
      2,
      -2,
      0.1,
      1000
    );
    orthographicCamera.position.z = 3;
    orthographicCameraRef.current = orthographicCamera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Setup orbit controls for both cameras
    const controls = new OrbitControls(perspectiveCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    const geometry = new THREE.TorusGeometry(1.1, 0.17, 64, 128, Math.PI * 2);

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: { value: 0.0 },
        diffuse: { value: new THREE.Color(0x8080ff) },
        opacity: { value: 1.0 },
        cameraPosition: { value: new THREE.Vector3() },
        uNoiseFrequency: { value: 50.0 },
        uNoiseIntensity: { value: 0.1 },
        uFresnelPower: { value: 3.0 },
        uGlowIntensity: { value: 0.3 },
        uGlowSpeed: { value: 1.5 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
    const circle = new THREE.Mesh(geometry, material);
    scene.add(circle);
    torusRef.current = circle;

    const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
    scene.add(ambientLight);

    // Setup EffectComposer and passes
    const currentCamera =
      cameraType === "perspective"
        ? perspectiveCameraRef.current
        : orthographicCameraRef.current;

    const composer = new EffectComposer(renderer);

    // Create and add the render pass
    const renderPass = new RenderPass(scene, currentCamera!);
    composer.addPass(renderPass);

    // Create and add the noise shader pass
    const noiseShader = {
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0.0 },
        uNoiseIntensity: { value: noiseSettings.intensity },
        uNoiseScale: { value: noiseSettings.scale },
        uNoiseSpeed: { value: noiseSettings.speed },
        uDistortionAmount: { value: noiseSettings.distortion },
      },
      vertexShader: noiseVertexShader,
      fragmentShader: noiseFragmentShader,
    };

    const noisePass = new ShaderPass(noiseShader);
    noisePass.renderToScreen = true;
    composer.addPass(noisePass);

    composerRef.current = composer;
    noisePassRef.current = noisePass;

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clockRef.current.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;

      // Update noise shader uniforms
      if (noisePass.uniforms.uTime) {
        noisePass.uniforms.uTime.value = elapsedTime;
      }

      const currentCamera =
        cameraType === "perspective"
          ? perspectiveCameraRef.current
          : orthographicCameraRef.current;

      if (currentCamera) {
        material.uniforms.cameraPosition.value.copy(currentCamera.position);
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (!torusRef.current) return;
      rotateTorus(torusRef.current, elapsedTime);

      // Render using composer instead of directly
      if (composerRef.current) {
        composerRef.current.render();
      }
    };
    animate();

    const handleResize = () => {
      if (!rendererRef.current) return;

      const aspect = window.innerWidth / window.innerHeight;

      if (perspectiveCameraRef.current) {
        perspectiveCameraRef.current.aspect = aspect;
        perspectiveCameraRef.current.updateProjectionMatrix();
      }

      if (orthographicCameraRef.current) {
        orthographicCameraRef.current.left = -aspect * 2;
        orthographicCameraRef.current.right = aspect * 2;
        orthographicCameraRef.current.updateProjectionMatrix();
      }

      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current.setPixelRatio(window.devicePixelRatio);

      // Update composer size
      if (composerRef.current) {
        composerRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    const currentMaterial = material;
    const currentGeometry = geometry;

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      currentGeometry.dispose();
      currentMaterial.dispose();

      if (rendererRef.current) rendererRef.current.dispose();
      if (controlsRef.current) controlsRef.current.dispose();
      if (composerRef.current) composerRef.current.dispose();

      scene.remove(circle);
      scene.remove(ambientLight);
    };
  }, [cameraType, noiseSettings]);

  // Update controls when camera type changes
  useEffect(() => {
    if (!controlsRef.current || !rendererRef.current) return;

    const currentCamera =
      cameraType === "perspective"
        ? perspectiveCameraRef.current
        : orthographicCameraRef.current;

    if (currentCamera) {
      controlsRef.current.object = currentCamera;
      controlsRef.current.update();
    }

    // Update renderPass camera reference when camera type changes
    if (composerRef.current && composerRef.current.passes.length > 0) {
      const renderPass = composerRef.current.passes[0] as RenderPass;
      if (renderPass && currentCamera) {
        renderPass.camera = currentCamera;
      }
    }
  }, [cameraType]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />
      <NoiseControls
        initialSettings={DEFAULT_NOISE_SETTINGS}
        onChange={handleNoiseSettingsChange}
      />
    </>
  );
}
