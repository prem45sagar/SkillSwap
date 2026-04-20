import { useRef, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Html,
} from "@react-three/drei";

function SkillObject({ color = "#6366f1" }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[2, 0]} />
        <MeshDistortMaterial color={color} speed={3} distort={0.4} radius={1} />
      </mesh>
      <mesh scale={1.2}>
        <octahedronGeometry args={[2, 0]} />
        <MeshWobbleMaterial
          color={color}
          speed={1}
          factor={0.6}
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
    </Float>
  );
}

export default function SkillModelViewer() {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const support = !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
      setWebglSupported(support);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className="w-full h-[500px] relative rounded-[3rem] overflow-hidden bg-slate-950/50 border border-white/10 backdrop-blur-xl flex items-center justify-center p-12 text-center">
        <div>
          <h4 className="text-white font-black text-2xl mb-4 group-hover:text-indigo-400 transition-colors uppercase italic tracking-tighter">
            The Knowledge <span className="text-indigo-500">Core</span>
          </h4>
          <p className="text-slate-400 text-sm max-w-[300px] font-medium leading-relaxed">
            Your browser may have WebGL disabled or blocked. SkillSwap's immersive 3D experience requires WebGL to be active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] relative rounded-[3rem] overflow-hidden bg-slate-950/50 border border-white/10 backdrop-blur-xl group">
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <h4 className="text-white font-black text-2xl mb-2">
          Interactive Skill Core
        </h4>
        <p className="text-slate-500 text-sm max-w-[200px]">
          Rotate and zoom to explore the essence of collaborative learning.
        </p>
      </div>

      <div className="absolute bottom-8 right-8 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Drag to Rotate • Scroll to Zoom
        </span>
      </div>

      <Canvas shadows dpr={[1, 2]} onError={() => setWebglSupported(false)}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense
          fallback={
            <Html center>
              <div className="text-white font-bold animate-pulse">
                Loading 3D...
              </div>
            </Html>
          }
        >
          <SkillObject />
          <Environment preset="city" />
          <ContactShadows
            position={[0, -3.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4.5}
          />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={12}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
