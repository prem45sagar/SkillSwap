import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Sphere,
  MeshDistortMaterial,
  Stars,
  Points,
  PointMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "@/src/context/ThemeContext";

function Particles({ count = 2000, color = "#4f46e5" }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 15;
      p[i * 3 + 1] = (Math.random() - 0.5) * 15;
      p[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return p;
  }, [count]);

  const pointsRef = useRef(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function AnimatedSphere({ color = "#4f46e5" }) {
  const sphereRef = useRef(null);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere ref={sphereRef} args={[1, 100, 100]} scale={2}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

export default function ThreeBackground() {
  const themeContext = useTheme();
  const theme = themeContext?.theme || "dark";
  const isDark = theme === "dark";
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const support = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setWebglSupported(support);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  if (!isDark) {
    return (
      <div className="fixed inset-0 -z-10 bg-slate-50 transition-colors duration-700" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10 transition-colors duration-700 bg-slate-950">
      {isDark && webglSupported && (
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => {
              gl.setClearColor(new THREE.Color("#020617"), 0);
            }}
            onError={() => setWebglSupported(false)}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight
              position={[-10, -10, -10]}
              color="#4f46e5"
              intensity={0.5}
            />
            <Stars
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />
            <Particles color="#4f46e5" />
            <AnimatedSphere color="#4f46e5" />
          </Canvas>
        </Suspense>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />
    </div>
  );
}
