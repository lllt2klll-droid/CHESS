import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/stores/useGameStore';
import { BoardCoordinate } from '@/types/game';
import { Chess } from 'chess.js';

const BOARD_WIDTH = 5.2;

export const Board3D: React.FC = () => {
  const { game, gameState, selectedCoord, legalTargets, lastMove, selectCoord } = useGameStore();

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

  // Find Checked King / General coordinate if in check
  const checkedKingCoord = useMemo<BoardCoordinate | null>(() => {
    if (!gameState.isCheck) return null;

    if (game === 'chess') {
      try {
        const chess = new Chess(gameState.fen);
        const board = chess.board();
        const kingColor = gameState.currentPlayer === 'p1' ? 'w' : 'b';
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'k' && p.color === kingColor) {
              return { x: c, y: 7 - r };
            }
          }
        }
      } catch {}
    } else if (game === 'xiangqi' && gameState.board) {
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 9; x++) {
          const p = gameState.board[y]?.[x];
          if (p && p.type === 'general' && p.player === gameState.currentPlayer) {
            return { x, y };
          }
        }
      }
    }
    return null;
  }, [game, gameState.isCheck, gameState.fen, gameState.currentPlayer, gameState.board]);

  // Animated check shockwave ring
  const checkRingRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (checkRingRef.current) {
      const t = (state.clock.getElapsedTime() * 3.5) % 1;
      const s = 1.0 + t * 0.8;
      checkRingRef.current.scale.set(s, s, s);
      const mat = checkRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = (1 - t) * 0.85;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ── Polished Walnut Frame ── */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.65, 0.2, BOARD_WIDTH + 0.65]} />
        <meshStandardMaterial color="#844f2d" roughness={0.32} metalness={0.06} />
      </mesh>

      {/* ── Golden Inlay Bevel ── */}
      <mesh position={[0, 0.202, 0]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.18, 0.005, BOARD_WIDTH + 0.18]} />
        <meshStandardMaterial color="#d49b55" roughness={0.25} metalness={0.4} />
      </mesh>

      {/* ── Board Top Surface ── */}
      <mesh position={[0, 0.204, 0]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.08, 0.005, BOARD_WIDTH + 0.08]} />
        <meshStandardMaterial
          color={game === 'xiangqi' || game === 'gomoku' ? '#e2c59b' : '#331e12'}
          roughness={0.38}
        />
      </mesh>

      {/* ── Grid / Squares (Chess & Checkers) ── */}
      {game === 'chess' || game === 'checkers' ? (
        <group position={[0, 0.207, 0]}>
          {Array.from({ length: 8 }).map((_, y) =>
            Array.from({ length: 8 }).map((_, x) => {
              const isDark = (x + y) % 2 === 1;
              const [wx, wy, wz] = coordToWorld(x, y);
              const isSelected = selectedCoord?.x === x && selectedCoord?.y === y;
              const isTarget = legalTargets.some((t) => t.x === x && t.y === y);
              const isLastFrom = lastMove?.from?.x === x && lastMove?.from?.y === y;
              const isLastTo = lastMove?.to?.x === x && lastMove?.to?.y === y;

              let squareColor = isDark ? '#6d4329' : '#f6eed6';
              if (isSelected) squareColor = '#5eead4';
              else if (isTarget) squareColor = '#93c5fd';
              else if (isLastTo) squareColor = '#fde047';
              else if (isLastFrom) squareColor = '#fef08a';

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
                    color={squareColor}
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
          {Array.from({ length: rows }).map((_, y) =>
            Array.from({ length: cols }).map((_, x) => {
              const [wx, wy, wz] = coordToWorld(x, y);
              const isSelected = selectedCoord?.x === x && selectedCoord?.y === y;
              const isTarget = legalTargets.some((t) => t.x === x && t.y === y);
              const isLastTo = lastMove?.to?.x === x && lastMove?.to?.y === y;

              return (
                <mesh
                  key={`pt-${x}-${y}`}
                  position={[wx, 0.002, wz]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  onClick={(e) => handleSquareClick(e, x, y)}
                >
                  <circleGeometry args={[squareSize * 0.42, 18]} />
                  <meshBasicMaterial
                    color={
                      isSelected
                        ? '#10b981'
                        : isTarget
                        ? '#3b82f6'
                        : isLastTo
                        ? '#f59e0b'
                        : '#2b1b11'
                    }
                    opacity={isSelected || isTarget || isLastTo ? 0.85 : 0.06}
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

      {/* ── "Chiếu Tướng" (Check) Danger Shockwave Beacon ── */}
      {checkedKingCoord && (
        <group position={coordToWorld(checkedKingCoord.x, checkedKingCoord.y)}>
          {/* Pulsing red shockwave ring */}
          <mesh
            ref={checkRingRef}
            position={[0, 0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[squareSize * 0.28, squareSize * 0.52, 28]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.7} />
          </mesh>

          {/* Glowing danger core on King square */}
          <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[squareSize * 0.42, 24]} />
            <meshBasicMaterial color="#dc2626" transparent opacity={0.4} />
          </mesh>
        </group>
      )}

      {/* ── Legal Move Glowing Markers (Pulsing Orbs) ── */}
      {legalTargets.map((target, idx) => {
        const [wx, wy, wz] = coordToWorld(target.x, target.y);
        return (
          <group key={`marker-${idx}`} position={[wx, wy + 0.05, wz]}>
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
