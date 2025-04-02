"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import vertexShader from "@/shaders/background.vert.glsl";
import fragmentShader from "@/shaders/background.frag.glsl";

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clockRef = useRef(new THREE.Clock());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const geometry = new THREE.CircleGeometry(1, 64);

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: { value: 0.0 },
        diffuse: { value: new THREE.Color(0x8080ff) },
        opacity: { value: 1.0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
    const circle = new THREE.Mesh(geometry, material);
    scene.add(circle);

    const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
    scene.add(ambientLight);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clockRef.current.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;

      circle.rotation.z += 0.002;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };
    window.addEventListener("resize", handleResize);

    const currentMaterial = material;
    const currentGeometry = geometry;

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      currentGeometry.dispose();
      currentMaterial.dispose();
      renderer.dispose();
      scene.remove(circle);
      scene.remove(ambientLight);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
}
