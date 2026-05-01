import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

export default function StaticSurfaceRegions() {
  const [probeX, setProbeX] = useState(0);
  const [probeZ, setProbeZ] = useState(0);

  const sceneToLabel = (sceneX: number, sceneZ: number) => {
    const labelX = -3 + (sceneX + 5) / 10 * 12;
    const labelZ = 0 + (sceneZ + 5) / 10 * 2.5;
    return { labelX, labelZ };
  };

  const labelYToScene = (labelY: number) => -5 + (labelY / 90) * 10;

  const getSurfaceHeightJS = (sceneX: number, sceneZ: number) => {
    const { labelX, labelZ } = sceneToLabel(sceneX, sceneZ);

    const labelYLower =
      1.4842 * labelX * labelX +
      5.9183 * labelZ * labelZ +
      14.8582 * labelX * labelZ +
      2.2586 * labelX +
      1.8397 * labelZ -
      52.1375;

    const labelYUpper =
      -3.5406 * labelX * labelX +
      30.3411 * labelZ * labelZ +
      24.5529 * labelX * labelZ -
      4.1132 * labelX -
      164.2330 * labelZ +
      207.8022;

    return {
      yLower: labelYToScene(labelYLower),
      yUpper: labelYToScene(labelYUpper)
    };
  };

  const { yLower: h1, yUpper: h2 } = getSurfaceHeightJS(probeX, probeZ);

  const inGreenRegion = h1 < h2 && h1 < 5 && h2 > -5;
  const probeStartY = Math.max(-5, h1);
  const probeEndY = Math.min(5, h2);

  const getProbeText = () => {
    if (!inGreenRegion || probeStartY >= probeEndY) return 'not stable!';
    const labelStart = ((probeStartY + 5) / 10) * 90;
    const labelEnd = ((probeEndY + 5) / 10) * 90;
    return `angle: ${labelStart.toFixed(1)}° - ${labelEnd.toFixed(1)}°`;
  };

  const getHeightGLSL = `
    float labelX(float sceneX) { return -3.0 + (sceneX + 5.0) / 10.0 * 12.0; }
    float labelZ(float sceneZ) { return 0.0 + (sceneZ + 5.0) / 10.0 * 2.5; }
    float sceneY(float labelY) { return -5.0 + (labelY / 90.0) * 10.0; }

    float yLower(float x, float z) {
      float lx = labelX(x);
      float lz = labelZ(z);
      float ly = 1.4842 * lx * lx + 5.9183 * lz * lz + 14.8582 * lx * lz +
                 2.2586 * lx + 1.8397 * lz - 52.1375;
      return sceneY(ly);
    }

    float yUpper(float x, float z) {
      float lx = labelX(x);
      float lz = labelZ(z);
      float ly = -3.5406 * lx * lx + 30.3411 * lz * lz + 24.5529 * lx * lz -
                 4.1132 * lx - 164.2330 * lz + 207.8022;
      return sceneY(ly);
    }
  `;

  // Critical points data
  const criticalPoints = [
    { x: -1, z: 0.75, y: 33 },
    { x: 0, z: 1.00, y: 55 },
    { x: 0, z: 1.50, y: 40 },
    { x: 1, z: 1.50, y: 52 },
    { x: 1, z: 1.50, y: 3 },
    { x: 1, z: 2.00, y: 38 },
    { x: 1, z: 2.00, y: 5 },
    { x: 3, z: 0.50, y: 15 },
    { x: 3, z: 0.75, y: 35 },
    { x: 6, z: 0.25, y: 47 },
    { x: 6, z: 0.50, y: 60 },
    { x: 6, z: 0.75, y: 76 },
  ];

  const DecorativeAxes = () => {
    const axisLength = 10;
    const labelSize = 0.36;
    const offset = 0.42;

    const xOrigin = [-5, -5, -5];
    const yzOriginX = -5 + (3 / 12) * axisLength;
    const yzOrigin = [yzOriginX, -5, -5];

    return (
      <>
        <group position={xOrigin}>
          <Line points={[[0, 0, 0], [axisLength, 0, 0]]} color="#ff4444" lineWidth={2.8} />
          <mesh position={[axisLength + 0.38, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.28, 0.65, 12]} /><meshBasicMaterial color="#ff4444" />
          </mesh>
          <mesh position={[-0.38, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.28, 0.65, 12]} /><meshBasicMaterial color="#ff4444" />
          </mesh>
          {[-3, 0, 3, 6, 9].map((val, i) => {
            const pos = ((val + 3) / 12) * axisLength;
            return <Text key={i} position={[pos, -offset, 0]} fontSize={labelSize} color="#ff8888" anchorX="center" anchorY="top">{val}</Text>;
          })}
        </group>

        <group position={yzOrigin}>
          <group>
            <Line points={[[0, 0, 0], [0, axisLength, 0]]} color="#44ff44" lineWidth={2.8} />
            <mesh position={[0, axisLength + 0.38, 0]}><coneGeometry args={[0.28, 0.65, 12]} /><meshBasicMaterial color="#44ff44" /></mesh>
            {[0, 30, 60, 90].map((val, i) => {
              const pos = (val / 90) * axisLength;
              return <Text key={i} position={[-offset, pos, 0]} fontSize={labelSize} color="#88ff88" anchorX="right" anchorY="middle">{val}</Text>;
            })}
          </group>

          <group>
            <Line points={[[0, 0, 0], [0, 0, axisLength]]} color="#4488ff" lineWidth={2.8} />
            <mesh position={[0, 0, axisLength + 0.38]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.28, 0.65, 12]} /><meshBasicMaterial color="#4488ff" /></mesh>
            {[0, 1, 2, 2.5].map((val, i) => {
              const pos = (val / 2.5) * axisLength;
              return <Text key={i} position={[0, -offset, pos]} fontSize={labelSize} color="#88aaff" anchorX="center" anchorY="top">{val}</Text>;
            })}
          </group>
        </group>
      </>
    );
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', position: 'relative' }}>
      <Canvas camera={{ position: [9, 7, 9], fov: 48 }} style={{ width: '100%', height: '100%' }}>

        {/* Regions */}
        <mesh>
          <boxGeometry args={[10, 10, 10]} />
          <shaderMaterial
            vertexShader={`
              varying vec3 vWorldPos;
              void main() {
                vWorldPos = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              varying vec3 vWorldPos;
              ${getHeightGLSL}

              void main() {
                float h1 = yLower(vWorldPos.x, vWorldPos.z);
                float h2 = yUpper(vWorldPos.x, vWorldPos.z);

                vec4 color;
                if (vWorldPos.y < h1 || vWorldPos.y > h2) {
                  color = vec4(0.9, 0.2, 0.2, 0.32);
                } else {
                  color = vec4(0.2, 0.85, 0.3, 0.32);
                }
                gl_FragColor = color;
              }
            `}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Lower Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10, 90, 90]} />
          <shaderMaterial
            vertexShader={`
              ${getHeightGLSL}
              varying vec3 vNormal;
              varying float vHeight;

              void main() {
                vec3 pos = position;
                vec2 xz = vec2(pos.x, -pos.y);
                float h1 = yLower(xz.x, xz.y);
                float h2 = yUpper(xz.x, xz.y);
                if (h1 > h2) discard;

                float height = h1;
                pos.z += height;
                vHeight = height;
                vNormal = normalize(normal + vec3(0.0, 0.0, height * 0.08));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `}
            fragmentShader={`
              varying vec3 vNormal;
              varying float vHeight;

              void main() {
                if (abs(vHeight) > 5.0) discard;
                vec3 lightDir = normalize(vec3(0.6, 1.0, 0.4));
                float diff = max(dot(normalize(vNormal), lightDir), 0.0);
                vec3 base = vec3(0.95, 0.95, 0.95);
                vec3 color = base * (0.6 + 0.4 * diff);
                gl_FragColor = vec4(color, 1.0);
              }
            `}
          />
        </mesh>

        {/* Upper Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10, 90, 90]} />
          <shaderMaterial
            vertexShader={`
              ${getHeightGLSL}
              varying vec3 vNormal;
              varying float vHeight;

              void main() {
                vec3 pos = position;
                vec2 xz = vec2(pos.x, -pos.y);
                float h1 = yLower(xz.x, xz.y);
                float h2 = yUpper(xz.x, xz.y);
                if (h1 > h2) discard;

                float height = h2;
                pos.z += height;
                vHeight = height;
                vNormal = normalize(normal + vec3(0.0, 0.0, height * 0.08));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `}
            fragmentShader={`
              varying vec3 vNormal;
              varying float vHeight;

              void main() {
                if (vHeight > 5.0) discard;
                vec3 lightDir = normalize(vec3(0.6, 1.0, 0.4));
                float diff = max(dot(normalize(vNormal), lightDir), 0.0);
                vec3 base = vec3(0.95, 0.95, 0.95);
                vec3 color = base * (0.6 + 0.4 * diff);
                gl_FragColor = vec4(color, 1.0);
              }
            `}
          />
        </mesh>

        {/* Critical Points as Spheres */}
        {criticalPoints.map((point, index) => {
          const sceneX = -5 + ((point.x + 3) / 12) * 10;
          const sceneZ = -5 + (point.z / 2.5) * 10;
          const sceneY = labelYToScene(point.y);
          return (
            <mesh key={index} position={[sceneX, sceneY, sceneZ]}>
              <sphereGeometry args={[0.12]} />
              <meshBasicMaterial color="#ff00ff" />
            </mesh>
          );
        })}

        {/* Probe */}
        {inGreenRegion && probeStartY < probeEndY && (
          <Line
            points={[[probeX, probeStartY, probeZ], [probeX, probeEndY, probeZ]]}
            color="#00ffff"
            lineWidth={4}
          />
        )}

        <DecorativeAxes />

        <mesh>
          <boxGeometry args={[10, 10, 10]} />
          <meshBasicMaterial wireframe color="#888888" transparent opacity={0.18} />
        </mesh>

        <OrbitControls enableDamping dampingFactor={0.1} minDistance={4} maxDistance={25} />
        <ambientLight intensity={0.2} />
        <pointLight position={[12, 15, 8]} intensity={0.6} />
      </Canvas>

      {/* Controls */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20,
        background: 'rgba(0,0,0,0.7)', padding: '16px 20px',
        borderRadius: '8px', color: '#fff', fontFamily: 'monospace', fontSize: '14px', zIndex: 10
      }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>X: {probeX.toFixed(1)}</label>
          <input type="range" min={-5} max={5} step={0.1} value={probeX}
                 onChange={(e) => setProbeX(parseFloat(e.target.value))} style={{ width: '220px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Z: {probeZ.toFixed(1)}</label>
          <input type="range" min={-5} max={5} step={0.1} value={probeZ}
                 onChange={(e) => setProbeZ(parseFloat(e.target.value))} style={{ width: '220px' }} />
        </div>
      </div>

      {/* Critical Points Table */}
      <div style={{
        position: 'absolute', bottom: 20, right: 20,
        background: 'rgba(0,0,0,0.85)', color: '#fff',
        padding: '12px 16px', borderRadius: '8px',
        fontFamily: 'monospace', fontSize: '12px', zIndex: 10,
        maxHeight: '320px', overflowY: 'auto'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#ff00ff' }}>
          Critical Points
        </div>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #555' }}>
              <th style={{ padding: '4px 8px', textAlign: 'left' }}>x (in)</th>
              <th style={{ padding: '4px 8px', textAlign: 'left' }}>z (lb)</th>
              <th style={{ padding: '4px 8px', textAlign: 'left' }}>y (°)</th>
            </tr>
          </thead>
          <tbody>
            {criticalPoints.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '3px 8px' }}>{p.x}</td>
                <td style={{ padding: '3px 8px' }}>{p.z}</td>
                <td style={{ padding: '3px 8px' }}>{p.y}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Probe Text */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)', color: '#00ffff', padding: '8px 20px',
        borderRadius: '6px', fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', zIndex: 20,
        textAlign: 'center', minWidth: '280px'
      }}>
        {getProbeText()}
      </div>
    </div>
  );
}