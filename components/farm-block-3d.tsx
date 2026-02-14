"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor, Instance, Instances } from "@react-three/drei";
import * as THREE from "three";

type FarmBlock3DProps = {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
    type: 'field' | 'barn' | 'house' | 'greenhouse' | 'irrigation' | 'storage';
    label: string;
    subLabel: string;
    progress: number;
    onClick: () => void;
};

const FarmBlock3D = ({ position, size, color, type, label, subLabel, progress, onClick }: FarmBlock3DProps) => {
    const mesh = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);
    useCursor(hovered);

    // Tech-focused palette
    const getThemeColor = (c: string) => {
        if (c.includes("primary") || c.includes("green")) return "#22c55e";
        if (c.includes("yellow") || c.includes("amber")) return "#f59e0b";
        if (c.includes("brown")) return "#a16207";
        return "#94a3b8";
    };
    const themeColor = getThemeColor(color);

    // Animation
    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, hovered ? position[1] + 0.2 : position[1], 0.1);
        }
    });

    const CropInstances = useMemo(() => {
        // Density based on crop type
        const isMaize = subLabel?.toLowerCase().includes('maize') || subLabel?.toLowerCase().includes('corn');
        const isTree = subLabel?.toLowerCase().includes('coffee') || subLabel?.toLowerCase().includes('fruit');

        const density = isTree ? 1 : 2.5;
        const countX = Math.floor(size[0] * density);
        const countZ = Math.floor(size[2] * density);
        const instances = [];

        for (let i = 0; i < countX; i++) {
            for (let j = 0; j < countZ; j++) {
                const x = (i / countX) * size[0] - size[0] / 2 + (size[0] / countX) / 2;
                const z = (j / countZ) * size[2] - size[2] / 2 + (size[2] / countZ) / 2;
                const scale = 0.8 + Math.random() * 0.4;
                instances.push({ position: [x, 0, z] as [number, number, number], scale });
            }
        }
        return instances;
    }, [size, subLabel]);

    const renderStructure = () => {
        switch (type) {
            case "house":
                return (
                    <group position={[0, size[1], 0]}>
                        {/* Main Body - White/Cream */}
                        <mesh position={[0, 0.4, 0]}>
                            <boxGeometry args={[size[0] * 0.7, 0.8, size[2] * 0.6]} />
                            <meshStandardMaterial color="#f1f5f9" />
                        </mesh>

                        {/* Roof - Dark Blue/Slate */}
                        <mesh position={[0, 0.8 + 0.25, 0]}>
                            <cylinderGeometry args={[0, size[0] * 0.55, 0.5, 4]} rotation={[0, Math.PI / 4, 0]} />
                            <meshStandardMaterial color="#1e293b" />
                        </mesh>

                        {/* Door */}
                        <mesh position={[0, 0.25, size[2] * 0.3 + 0.01]}>
                            <planeGeometry args={[0.25, 0.5]} />
                            <meshStandardMaterial color="#78350f" />
                        </mesh>

                        {/* Window Left */}
                        <mesh position={[-0.4, 0.4, size[2] * 0.3 + 0.01]}>
                            <planeGeometry args={[0.25, 0.25]} />
                            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
                        </mesh>

                        {/* Window Right */}
                        <mesh position={[0.4, 0.4, size[2] * 0.3 + 0.01]}>
                            <planeGeometry args={[0.25, 0.25]} />
                            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
                        </mesh>
                    </group>
                );
            case "barn":
                return (
                    <group position={[0, size[1], 0]}>
                        <mesh position={[0, 0.5, 0]}>
                            <boxGeometry args={[size[0] * 0.8, 1, size[2] * 0.8]} />
                            <meshStandardMaterial color="#ef4444" />
                        </mesh>
                        <mesh position={[0, 1 + 0.4, 0]}>
                            <cylinderGeometry args={[size[0] * 0.4, size[0] * 0.4, size[2] * 0.8, 3]} rotation={[Math.PI / 2, 0, 0]} />
                            {/* Using a rough shape for barn roof, actually cylinder on side is tricky without rotation prop on geo. 
                             Simpler to use a prism (cylinder with 3 segments) */}
                        </mesh>
                        <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
                            <cylinderGeometry args={[size[0] * 0.4, size[0] * 0.4, size[2] * 0.9, 3]} />
                            <meshStandardMaterial color="#991b1b" />
                        </mesh>
                    </group>
                );
            case "storage": // SILO Look
                return (
                    <group position={[0, size[1], 0]}>
                        <mesh position={[-size[0] * 0.2, 0.8, 0]}>
                            <cylinderGeometry args={[0.4, 0.4, 1.6, 16]} />
                            <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.2} />
                        </mesh>
                        <mesh position={[-size[0] * 0.2, 1.6 + 0.2, 0]}>
                            <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.2} />
                        </mesh>
                        {/* Second smaller silo */}
                        <mesh position={[size[0] * 0.2, 0.6, size[2] * 0.2]}>
                            <cylinderGeometry args={[0.25, 0.25, 1.2, 16]} />
                            <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.2} />
                        </mesh>
                        <mesh position={[size[0] * 0.2, 1.2 + 0.125, size[2] * 0.2]}>
                            <sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.2} />
                        </mesh>
                    </group>
                );
            case "irrigation": // WATCH TOWER / WATER TOWER Look
                return (
                    <group position={[0, size[1], 0]}>
                        {/* Legs */}
                        <mesh position={[0.3, 0.8, 0.3]} rotation={[0, 0, -0.1]}>
                            <cylinderGeometry args={[0.05, 0.05, 1.8]} />
                            <meshStandardMaterial color="#475569" />
                        </mesh>
                        <mesh position={[-0.3, 0.8, 0.3]} rotation={[0, 0, 0.1]}>
                            <cylinderGeometry args={[0.05, 0.05, 1.8]} />
                            <meshStandardMaterial color="#475569" />
                        </mesh>
                        <mesh position={[0.3, 0.8, -0.3]} rotation={[0.1, 0, 0]}>
                            <cylinderGeometry args={[0.05, 0.05, 1.8]} />
                            <meshStandardMaterial color="#475569" />
                        </mesh>
                        <mesh position={[-0.3, 0.8, -0.3]} rotation={[-0.1, 0, 0]}>
                            <cylinderGeometry args={[0.05, 0.05, 1.8]} />
                            <meshStandardMaterial color="#475569" />
                        </mesh>

                        {/* Tank/Platform */}
                        <mesh position={[0, 1.8, 0]}>
                            <cylinderGeometry args={[0.5, 0.4, 0.6, 8]} />
                            <meshStandardMaterial color="#0ea5e9" metalness={0.3} />
                        </mesh>
                        <mesh position={[0, 2.1, 0]}>
                            <coneGeometry args={[0.55, 0.3, 8]} />
                            <meshStandardMaterial color="#0284c7" />
                        </mesh>
                    </group>
                );
            case "greenhouse":
                return (
                    <mesh position={[0, 0.4, 0]}>
                        <boxGeometry args={[size[0] * 0.8, 0.6, size[2] * 0.8]} />
                        <meshStandardMaterial color="#06b6d4" transparent opacity={0.4} roughness={0} metalness={0.9} />
                        <lineSegments>
                            <edgesGeometry args={[new THREE.BoxGeometry(size[0] * 0.8, 0.6, size[2] * 0.8)]} />
                            <lineBasicMaterial color="#ffffff" transparent opacity={0.5} />
                        </lineSegments>
                    </mesh>
                )
            default: return null;
        }
    }

    const renderCrops = () => {
        if (type !== 'field') return null;
        if (!subLabel || subLabel === "Unknown" || subLabel === "None") return null;

        // Check both subLabel (crop) and label (block name)
        const lowerLabel = (subLabel + " " + label).toLowerCase();

        // 1. MAIZE / CORN (Tall cylinders + leaves)
        if (lowerLabel.includes('maize') || lowerLabel.includes('corn')) {
            return (
                <Instructions>
                    <cylinderGeometry args={[0.03, 0.03, 0.8, 5]} />
                    <meshStandardMaterial color="#16a34a" />
                    {/* Top Tassel */}
                    <group position={[0, 0.4, 0]}>
                        <mesh position={[0, 0.05, 0]}>
                            <sphereGeometry args={[0.08]} />
                            <meshStandardMaterial color="#fcd34d" />
                        </mesh>
                    </group>
                </Instructions>
            )
        }

        // 2. COFFEE / TREES (Spheres on trunks)
        if (lowerLabel.includes('coffee') || lowerLabel.includes('fruit') || lowerLabel.includes('tree')) {
            return (
                <Instructions>
                    <group>
                        <mesh position={[0, 0.3, 0]}>
                            <cylinderGeometry args={[0.08, 0.1, 0.6, 5]} />
                            <meshStandardMaterial color="#78350f" />
                        </mesh>
                        <mesh position={[0, 0.7, 0]}>
                            <dodecahedronGeometry args={[0.35, 0]} />
                            <meshStandardMaterial color="#15803d" />
                        </mesh>
                    </group>
                </Instructions>
            )
        }

        // 3. BEANS / VEGGIES (Small bushes/spheres)
        // Default fallback
        return (
            <Instructions>
                <sphereGeometry args={[0.15, 6, 6]} />
                <meshStandardMaterial color="#4ade80" />
            </Instructions>
        )
    }

    // Helper to wrap instances
    const Instructions = ({ children }: { children: React.ReactNode }) => (
        <group position={[0, 0.1, 0]}>
            <Instances range={100}>
                {children}
                {CropInstances.map((data, i) => (
                    <Instance key={i} position={data.position} scale={[data.scale, data.scale, data.scale]} />
                ))}
            </Instances>
        </group>
    )


    return (
        <group>
            {/* Base Platform */}
            <mesh
                ref={mesh}
                position={position}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
                onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
            >
                <boxGeometry args={size} />
                <meshStandardMaterial
                    color={hovered ? "#3b82f6" : "#1e293b"}
                    transparent opacity={0.8}
                />
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(size[0], size[1], size[2])]} />
                    <lineBasicMaterial color={hovered ? "#60a5fa" : "#334155"} />
                </lineSegments>
            </mesh>

            {/* Structure or Crops moved relative to base */}
            <group position={[position[0], position[1], position[2]]}>
                {renderStructure()}
                {renderCrops()}
            </group>

            {/* Floating Label */}
            <Html position={[position[0], position[1] + 2, position[2]]} center distanceFactor={12} zIndexRange={[100, 0]}>
                <div className={`
                pointer-events-none select-none transition-all duration-300
                ${hovered ? 'scale-110 opacity-100' : 'scale-100 opacity-90'}
            `}>
                    <div className="flex flex-col items-center">
                        <div className="bg-black/80 backdrop-blur-md border border-[#3b82f6]/50 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] flex flex-col items-center">
                            <span className="text-white font-bold whitespace-nowrap text-[10px] tracking-widest uppercase">{subLabel || label}</span>
                            {subLabel && <span className="text-[#c0ff01] text-[9px] font-mono mt-0.5">HEALTH: {progress}%</span>}
                        </div>
                        <div className="w-px h-8 bg-gradient-to-b from-[#3b82f6] to-transparent"></div>
                    </div>
                </div>
            </Html>
        </group>
    );
};

export default FarmBlock3D;
