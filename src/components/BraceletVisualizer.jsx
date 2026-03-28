import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, MeshRefractionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Procedurally generate a simple diamond shape geometry
const generateDiamondGeom = () => {
  const points = [];
  // We'll create a lathe geometry
  points.push(new THREE.Vector2(0.00, -0.43)); // culet
  points.push(new THREE.Vector2(0.35,  0.00)); // girdle bottom
  points.push(new THREE.Vector2(0.35,  0.03)); // girdle top
  points.push(new THREE.Vector2(0.20,  0.18)); // table edge
  points.push(new THREE.Vector2(0.00,  0.18)); // table center
  return new THREE.LatheGeometry(points, 16);
};

const diamondGeom = generateDiamondGeom();

const DiamondMesh = ({ position, rotation, scale = 1 }) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={diamondGeom}>
        {/* A beautiful physically based glass/diamond material */}
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={1}
          opacity={1}
          metalness={0.1}
          roughness={0}
          ior={2.42}
          thickness={0.5}
          specularIntensity={2.0}
          specularColor="#ffffff"
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2.5}
        />
      </mesh>
      
      {/* Simple 4-prong setting visual under the diamond */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.36, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#e0e0e0" metalness={1} roughness={0.2} />
      </mesh>
      {/* Prongs */}
      {[-1, 1].map((x) => 
        [-1, 1].map((z) => (
          <mesh position={[x * 0.25, 0.05, z * 0.25]} key={`${x}-${z}`}>
            <cylinderGeometry args={[0.04, 0.04, 0.35]} />
            <meshStandardMaterial color="#e0e0e0" metalness={1} roughness={0.1} />
          </mesh>
        ))
      )}
    </group>
  );
};

const BraceletLayout = ({ params }) => {
  const { numDiamonds, diameter, gap } = params;
  const groupRef = useRef();

  // Calculate positions in a circle/ellipse
  const layout = useMemo(() => {
    const items = [];
    const linkSize = diameter + gap;
    // Real circumference is numDiamonds * linkSize
    const circumference = numDiamonds * linkSize;
    // Radius of the bracelet loop
    const radius = circumference / (2 * Math.PI);
    
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < numDiamonds; i++) {
      const angle = (i / numDiamonds) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      dummy.position.set(x, 0, z);
      dummy.lookAt(x * 2, 0, z * 2);
      dummy.rotateX(Math.PI / 2);
      
      items.push({
        position: [x, 0, z],
        rotation: new THREE.Euler().copy(dummy.rotation),
        scale: diameter / 0.7
      });
    }
    return items;
  }, [numDiamonds, diameter, gap]);

  return (
    <group ref={groupRef}>
      {layout.map((item, idx) => (
        <DiamondMesh 
          key={idx} 
          position={item.position} 
          rotation={item.rotation} 
          scale={item.scale} 
        />
      ))}
    </group>
  );
};

// Auto-adjust camera to fit the bracelet based on length
const CameraController = ({ length }) => {
  const { camera } = useThree();
  useEffect(() => {
    const radius = length / (2 * Math.PI);
    camera.position.set(0, radius * 1.5, radius * 2.5);
    camera.lookAt(0, 0, 0);
  }, [length, camera]);
  return null;
};

const BraceletVisualizer = ({ params }) => {
  return (
    <Canvas 
      camera={{ position: [0, 50, 100], fov: 45 }} 
      gl={{ antialias: true, alpha: true }}
    >
      <CameraController length={params.length} />
      
      <color attach="background" args={['#050810']} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={2} castShadow />
      <directionalLight position={[-10, 5, -10]} intensity={1} color="#a0c0ff" />
      
      {/* Essential for realistic glass rendering! */}
      <Environment preset="city" background={false} />

      {/* Removed Float entirely to ensure stable drag and zoom, or keep it minimal */}
      <group>
        <BraceletLayout params={params} />
      </group>

      <ContactShadows 
        position={[0, -20, 0]} 
        opacity={0.4} 
        scale={200} 
        blur={2} 
        far={50} 
      />

      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={10}
        maxDistance={500}
      />
    </Canvas>
  );
};

export default BraceletVisualizer;
