import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/stores/useGameStore';
import { BoardCoordinate } from '@/types/game';

const BOARD_WIDTH = 5.2;

export const Board3D: React.FC = () => {
  const { game, selectedCoord, legalTargets, selectCoord } = useGameStore();

  const { cols, rows, squareSize, offsetX, offsetZ } = useMemo(() => {
    let c = 8;
    let r = 8;
    if (game === 'xiangqi') { c = 9; r = 10; }
    else if (game === 'gomoku') { c = 15; r = 15; }

    const sSize = BOARD_WIDTH / Math.max(c, r);
    const ox = -((c - 1) * sSize) / 2;
    const oz = -((r - 1) * sSize) / 2;

    return { cols: c, rows: r, squareSize: sSize, offsetX: ox, offsetZ: oz };
  }, [game]);

  const coordToWorld = (x: number, y: number): [number, number, number] => {
    const wx = offsetX + x * squareSize;
    const wz = -(offsetZ + y * squareSize);
    return [wx, 0.21, wz];
  };

  const handleSquareClick = (e: any, x: number, y: number) => {
    e.stopPropagation();
    selectCoord({ x, y });
  };

  return (
    <group position={[0, 0, 0]}>
      {/* ── Warm Polished Walnut Board Outer Frame ── */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.65, 0.2, BOARD_WIDTH + 0.65]} />
        <meshStandardMaterial
          color="#844f2d"
          roughness={0.32}
          metalness={0.06}
        />
      </mesh>

      {/* ── Subtle Golden Inlay Border Bevel ── */}
      <mesh position={[0, 0.202, 0]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.18, 0.005, BOARD_WIDTH + 0.18]} />
        <meshStandardMaterial
          color="#d49b55"
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>

      {/* ── Board Top Surface ── */}
      <mesh position={[0, 0.204, 0]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.08, 0.005, BOARD_WIDTH + 0.08]} />
        <meshStandardMaterial
          color={game === 'xiangqi' || game === 'gomoku' ? '#e2c59b' : '#331e12'}
          roughness={0.38}
        />
      </mesh>

      {/* ── Grid / Squares for Chess & Checkers ── */}
      {game === 'chess' || game === 'checkers' ? (
        <group position={[0, 0.207, 0]}>
          {Array.from({ length: 8 }).map((_, y) =>
            Array.from({ length: 8 }).map((_, x) => {
              const isDark = (x + y) % 2 === 1;
              const [wx, wy, wz] = coordToWorld(x, y);
              const isSelected = selectedCoord?.x === x && selectedCoord?.y === y;
              const isTarget = legalTargets.some((t) => t.x === x && t.y === y);

              return (
                <mesh
                  key={`sq-${x}-${y}`}
                  position={[wx, 0, wz]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  onClick={(e) => handleSquareClick(e, x, y)}
                  receiveShadow
                >
                  <planeGeometry args={[squareSize * 0.985, squareSize * 0.985]} />
                  <meshStandardMaterial
                    color={
                      isSelected
                        ? '#5eead4' // Soft luminous turquoise for selected
                        : isTarget
                        ? '#93c5fd'
                        : isDark
                        ? '#6d4329' // Warm rich caramel chestnut
                        : '#f6eed6' // Warm creamy maple
                    }
                    roughness={0.32}
                    metalness={0.03}
                  />
                </mesh>
              );
            })
          )}
        </group>
      ) : (
        // Xiangqi or Gomoku Grid
        <group position={[0, 0.207, 0]}>
          {/* Clickable Intersections */}
          {Array.from({ length: rows }).map((_, y) =>
            Array.from({ length: cols }).map((_, x) => {
              const [wx, wy, wz] = coordToWorld(x, y);
              const isSelected = selectedCoord?.x === x && selectedCoord?.y === y;
              const isTarget = legalTargets.some((t) => t.x === x && t.y === y);

              return (
                <mesh
                  key={`pt-${x}-${y}`}
                  position={[wx, 0.002, wz]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  onClick={(e) => handleSquareClick(e, x, y)}
                >
                  <circleGeometry args={[squareSize * 0.42, 16]} />
                  <meshBasicMaterial
                    color={isSelected ? '#10b981' : isTarget ? '#3b82f6' : '#2b1b11'}
                    opacity={isSelected || isTarget ? 0.75 : 0.06}
                    transparent
                  />
                </mesh>
              );
            })
          )}

          {/* Grid lines */}
          {Array.from({ length: rows }).map((_, y) => {
            const [, , wz] = coordToWorld(0, y);
            return (
              <mesh key={`hline-${y}`} position={[0, 0.001, wz]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[squareSize * (cols - 1), 0.016]} />
                <meshBasicMaterial color="#3a2517" />
              </mesh>
            );
          })}
          {Array.from({ length: cols }).map((_, x) => {
            const [wx] = coordToWorld(x, 0);
            return (
              <mesh key={`vline-${x}`} position={[wx, 0.001, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                <planeGeometry args={[squareSize * (rows - 1), 0.016]} />
                <meshBasicMaterial color="#3a2517" />
              </mesh>
            );
          })}
        </group>
      )}

      {/* ── Legal Move Glowing Markers ── */}
      {legalTargets.map((target, idx) => {
        const [wx, wy, wz] = coordToWorld(target.x, target.y);
        return (
          <group key={`marker-${idx}`} position={[wx, wy + 0.06, wz]}>
            {/* Inner pulsing orb */}
            <mesh onClick={(e) => handleSquareClick(e, target.x, target.y)}>
              <sphereGeometry args={[squareSize * 0.16, 16, 16]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={0.8}
                transparent
                opacity={0.88}
              />
            </mesh>
            {/* Subtle glow ring on ground */}
            <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[squareSize * 0.22, squareSize * 0.28, 20]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
