import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  Stage,
  PerspectiveCamera,
  MeshDistortMaterial,
  MeshWobbleMaterial,
} from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";

function AvatarModel({ model, color }) {
  if (model === "cube") {
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <MeshWobbleMaterial color={color} factor={0.5} speed={2} />
      </mesh>
    );
  }

  if (model === "sphere") {
    return (
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        <MeshDistortMaterial color={color} speed={2} distort={0.3} radius={1} />
      </mesh>
    );
  }

  if (model === "capsule") {
    return (
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.5, 1, 4, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
    );
  }

  if (model === "robot") {
    return (
      <group>
        {/* Head */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.15, 0.9, 0.3]} castShadow>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2}
          />
        </mesh>
        <mesh position={[-0.15, 0.9, 0.3]} castShadow>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2}
          />
        </mesh>
        {/* Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.8, 1, 0.5]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Arms */}
        <mesh position={[0.6, 0.1, 0]} castShadow>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[-0.6, 0.1, 0]} castShadow>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  }

  return null;
}

export default function Avatar3DViewer({ model, color, rotation = 0 }) {
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
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2">
           <span className="text-2xl font-black text-indigo-500">{model?.[0]?.toUpperCase()}</span>
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">3D Unavailable</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <Canvas shadows dpr={[1, 2]} onError={() => setWebglSupported(false)}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <group rotation={[0, rotation, 0]}>
                <AvatarModel model={model} color={color} />
              </group>
            </Float>
          </Stage>
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
