"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "@/shaders/background.vert.glsl";
import fragmentShader from "@/shaders/background.frag.glsl";

type CameraType = "perspective" | "orthographic";

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

  function rotateTorus(mesh: THREE.Mesh, time: number) {
    mesh.rotation.y = -Math.sin(time * 0.037) * 3.3;
  }

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

    const geometry = new THREE.TorusGeometry(1.1, 0.017, 16, 64, Math.PI * 2);

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

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clockRef.current.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;

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

      if (rendererRef.current && currentCamera) {
        rendererRef.current.render(scene, currentCamera);
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

      scene.remove(circle);
      scene.remove(ambientLight);
    };
  }, [cameraType]);

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
  }, [cameraType]);

  // const toggleCameraType = () => {
  //   setCameraType((prev) =>
  //     prev === "perspective" ? "orthographic" : "perspective"
  //   );
  // };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />
      <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3 z-10">
        <div className="flex gap-3 items-center">
          {/* <button
            onClick={toggleCameraType}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            {cameraType === "perspective"
              ? "Switch to Orthographic"
              : "Switch to Perspective"}
          </button>
          <div className="text-white text-sm">
            Current:{" "}
            <span className="font-semibold">
              {cameraType === "perspective" ? "Perspective" : "Orthographic"}
            </span>
          </div> */}
        </div>
      </div>
    </>
  );
}
