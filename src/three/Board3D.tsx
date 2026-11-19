import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/stores/useGameStore';
import { BoardCoordinate } from '@/types/game';

const BOARD_WIDTH = 5.2;

export const Board3D: React.FC = () => {
  const { game, selectedCoord, legalTargets, selectCoord } = useGameStore();

  // Coordinate mapper from board (x, y) to 3D world space (wx, wy, wz)
  // Let board center be at (0, 0, 0) in X-Z plane, board top surface at Y = 0.2
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
    // Note: y in engine usually goes 0 to rows-1.
    // In Chess/Checkers/Xiangqi, y=0 is opponent (far, -Z), y=max is player (near, +Z)
    const wx = offsetX + x * squareSize;
    const wz = -(offsetZ + y * squareSize); // Inverted so 0 is top
    return [wx, 0.21, wz];
  };

  const handleSquareClick = (e: any, x: number, y: number) => {
    e.stopPropagation();
    selectCoord({ x, y });
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Wooden Board Base Frame */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.6, 0.2, BOARD_WIDTH + 0.6]} />
        <meshStandardMaterial color="#4a2e1b" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Board Top Surface */}
      <mesh position={[0, 0.201, 0]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.1, 0.01, BOARD_WIDTH + 0.1]} />
        <meshStandardMaterial
          color={game === 'xiangqi' || game === 'gomoku' ? '#dfbe92' : '#2b1a10'}
          roughness={0.5}
        />
      </mesh>

      {/* Grid / Squares */}
      {game === 'chess' || game === 'checkers' ? (
        // 8x8 Chess / Checkers Squares
        <group position={[0, 0.205, 0]}>
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
                  <planeGeometry args={[squareSize * 0.98, squareSize * 0.98]} />
                  <meshStandardMaterial
                    color={
                      isSelected
                        ? '#6ee7b7'
                        : isTarget
                        ? '#93c5fd'
                        : isDark
                        ? '#5c3826'
                        : '#f5edd6'
                    }
                    roughness={0.4}
                  />
                </mesh>
              );
            })
          )}
        </group>
      ) : (
        // Xiangqi or Gomoku Intersections & Lines
        <group position={[0, 0.205, 0]}>
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
                    color={isSelected ? '#10b981' : isTarget ? '#3b82f6' : '#291b10'}
                    opacity={isSelected || isTarget ? 0.75 : 0.08}
                    transparent
                  />
                </mesh>
              );
            })
          )}

          {/* Grid lines rendered on board surface */}
          {Array.from({ length: rows }).map((_, y) => {
            const [, , wz] = coordToWorld(0, y);
            return (
              <mesh key={`hline-${y}`} position={[0, 0.001, wz]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[squareSize * (cols - 1), 0.015]} />
                <meshBasicMaterial color="#3d2817" />
              </mesh>
            );
          })}
          {Array.from({ length: cols }).map((_, x) => {
            const [wx] = coordToWorld(x, 0);
            return (
              <mesh key={`vline-${x}`} position={[wx, 0.001, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                <planeGeometry args={[squareSize * (rows - 1), 0.015]} />
                <meshBasicMaterial color="#3d2817" />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Legal Move Markers (Pulsing glowing spheres) */}
      {legalTargets.map((target, idx) => {
        const [wx, wy, wz] = coordToWorld(target.x, target.y);
        return (
          <mesh
            key={`marker-${idx}`}
            position={[wx, wy + 0.05, wz]}
            onClick={(e) => handleSquareClick(e, target.x, target.y)}
          >
            <sphereGeometry args={[squareSize * 0.16, 16, 16]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.6}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
};
