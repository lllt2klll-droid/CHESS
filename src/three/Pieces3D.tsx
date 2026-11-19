import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/stores/useGameStore';
import { BoardCoordinate } from '@/types/game';
import { Chess } from 'chess.js';

const BOARD_WIDTH = 5.2;

// ─────────────────────────────────────────────
// LatheGeometry profiles for each chess piece
// Each point: [radius, height] from bottom to top
// ─────────────────────────────────────────────

function makeLathePoints(profile: [number, number][]): THREE.Vector2[] {
  return profile.map(([r, y]) => new THREE.Vector2(r, y));
}

// PAWN: round head, narrow neck, wide base
const PAWN_PROFILE = makeLathePoints([
  [0.00, 0.00], [0.21, 0.00], [0.23, 0.02], [0.21, 0.06],
  [0.18, 0.09], [0.14, 0.13], [0.11, 0.17], [0.09, 0.22],
  [0.08, 0.24], [0.07, 0.26], [0.07, 0.28], // neck
  [0.11, 0.30], [0.13, 0.33], [0.13, 0.36],
  [0.11, 0.39], [0.08, 0.41], [0.00, 0.41], // top ball
]);

// ROOK: battlemented top, solid body
const ROOK_PROFILE = makeLathePoints([
  [0.00, 0.00], [0.22, 0.00], [0.24, 0.02], [0.22, 0.06],
  [0.19, 0.10], [0.15, 0.14], [0.13, 0.19], [0.12, 0.25],
  [0.12, 0.30], [0.14, 0.32], [0.16, 0.34], // platform
  [0.17, 0.36], [0.17, 0.46],                // tower walls
  [0.16, 0.48], [0.13, 0.48],                // battlement inner
  [0.13, 0.00],                               // close inner cylinder
]);

// KNIGHT: angular stylized body — built from primitives, not lathe
// (handled separately in JSX)

// BISHOP: tall tapered body with ball finial and collar notch
const BISHOP_PROFILE = makeLathePoints([
  [0.00, 0.00], [0.22, 0.00], [0.24, 0.02], [0.22, 0.06],
  [0.18, 0.10], [0.14, 0.14], [0.11, 0.18], [0.09, 0.23],
  [0.08, 0.28], [0.07, 0.31], [0.09, 0.33], [0.11, 0.35], // collar
  [0.11, 0.37], [0.08, 0.38], [0.07, 0.40],               // notch
  [0.07, 0.42], [0.09, 0.44], [0.10, 0.47],               // ball base
  [0.10, 0.50], [0.08, 0.53], [0.05, 0.55],               // ball top
  [0.03, 0.57], [0.00, 0.58],                              // finial
]);

// QUEEN: tall body with crown indentation and orb
const QUEEN_PROFILE = makeLathePoints([
  [0.00, 0.00], [0.23, 0.00], [0.25, 0.02], [0.23, 0.07],
  [0.19, 0.11], [0.15, 0.16], [0.12, 0.21], [0.10, 0.27],
  [0.09, 0.32], [0.10, 0.35], [0.12, 0.37], // collar
  [0.12, 0.40], [0.10, 0.43], [0.09, 0.46], // neck above collar
  [0.11, 0.48], [0.14, 0.52], [0.16, 0.56], // crown base
  [0.16, 0.59], [0.13, 0.62], [0.11, 0.64],
  [0.10, 0.66], [0.11, 0.68],               // orb bottom
  [0.00, 0.68],
]);

// KING: tall body with flat crown platform
const KING_PROFILE = makeLathePoints([
  [0.00, 0.00], [0.23, 0.00], [0.25, 0.02], [0.23, 0.07],
  [0.19, 0.11], [0.15, 0.16], [0.12, 0.21], [0.10, 0.27],
  [0.09, 0.33], [0.10, 0.36], [0.12, 0.38], // collar
  [0.12, 0.42], [0.10, 0.45], [0.09, 0.48],
  [0.10, 0.50], [0.14, 0.53], [0.17, 0.57], // crown base flare
  [0.17, 0.62], [0.14, 0.64], [0.12, 0.65],
  [0.12, 0.68], [0.10, 0.70],               // cross base
  [0.00, 0.70],
]);

// ─────────────────────────────────────────────
// Piece materials
// ─────────────────────────────────────────────

function usePieceMaterials(isWhite: boolean) {
  return useMemo(() => ({
    main: {
      color:    isWhite ? '#ede8d8' : '#1a0f07',
      roughness: isWhite ? 0.28 : 0.38,
      metalness: isWhite ? 0.04 : 0.12,
      envMapIntensity: 1.2,
    },
    accent: {
      color: '#d4a832',
      roughness: 0.2,
      metalness: 0.7,
    },
  }), [isWhite]);
}

// ─────────────────────────────────────────────
// LatheGeometry mesh helper
// ─────────────────────────────────────────────

interface LateMeshProps {
  points: THREE.Vector2[];
  segments?: number;
  color: string;
  roughness: number;
  metalness: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  position?: [number, number, number];
}

const LatheMesh: React.FC<LateMeshProps> = ({
  points, segments = 20, color, roughness, metalness,
  castShadow = true, receiveShadow = true, position = [0, 0, 0],
}) => {
  const geo = useMemo(() => {
    const g = new THREE.LatheGeometry(points, segments);
    g.computeVertexNormals();
    return g;
  }, [points, segments]);

  return (
    <mesh geometry={geo} position={position} castShadow={castShadow} receiveShadow={receiveShadow}>
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
};

// ─────────────────────────────────────────────
// CHESS PIECE MESH (LatheGeometry)
// ─────────────────────────────────────────────

const ChessPieceMesh: React.FC<{ type: string; isWhite: boolean; size: number }> = ({
  type, isWhite, size,
}) => {
  const scale = size * 1.6;
  const mat   = {
    color:    isWhite ? '#fefcf6' : '#22150c',
    roughness: isWhite ? 0.22 : 0.32,
    metalness: isWhite ? 0.02 : 0.08,
  };
  const gold = { color: '#f5c342', roughness: 0.16, metalness: 0.8 };

  return (
    <group scale={[scale, scale, scale]}>

      {/* ── PAWN ── */}
      {type === 'p' && (
        <LatheMesh points={PAWN_PROFILE} segments={18} {...mat} />
      )}

      {/* ── ROOK ── */}
      {type === 'r' && (
        <group>
          {/* Main body via lathe */}
          <LatheMesh points={ROOK_PROFILE} segments={18} {...mat} />
          {/* Battlement notches: 4 cuts on top */}
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 4) * Math.PI * 2) * 0.145,
                0.42,
                Math.sin((i / 4) * Math.PI * 2) * 0.145,
              ]}
              castShadow
            >
              <boxGeometry args={[0.07, 0.11, 0.07]} />
              <meshStandardMaterial {...mat} />
            </mesh>
          ))}
        </group>
      )}

      {/* ── KNIGHT — stylized horse head ── */}
      {type === 'n' && (
        <group>
          {/* Base */}
          <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.21, 0.24, 0.07, 18]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Neck step */}
          <mesh position={[0, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.19, 0.06, 16]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Body shaft */}
          <mesh position={[0, 0.19, 0.02]} rotation={[0.22, 0, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.15, 0.22, 14]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Neck */}
          <mesh position={[0, 0.34, 0.03]} rotation={[0.3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 0.17, 12]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.44, 0.04]} castShadow>
            <boxGeometry args={[0.14, 0.14, 0.18]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Muzzle */}
          <mesh position={[0, 0.41, 0.12]} castShadow>
            <boxGeometry args={[0.10, 0.09, 0.08]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Ear */}
          <mesh position={[0, 0.52, 0.00]} castShadow>
            <coneGeometry args={[0.04, 0.09, 8]} />
            <meshStandardMaterial {...mat} />
          </mesh>
        </group>
      )}

      {/* ── BISHOP ── */}
      {type === 'b' && (
        <LatheMesh points={BISHOP_PROFILE} segments={18} {...mat} />
      )}

      {/* ── QUEEN ── */}
      {type === 'q' && (
        <group>
          <LatheMesh points={QUEEN_PROFILE} segments={20} {...mat} />
          {/* Crown spires */}
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 5) * Math.PI * 2) * 0.14,
                0.62,
                Math.sin((i / 5) * Math.PI * 2) * 0.14,
              ]}
              castShadow
            >
              <sphereGeometry args={[0.025, 10, 10]} />
              <meshStandardMaterial {...gold} />
            </mesh>
          ))}
          {/* Centre orb */}
          <mesh position={[0, 0.70, 0]} castShadow>
            <sphereGeometry args={[0.038, 14, 14]} />
            <meshStandardMaterial {...gold} />
          </mesh>
        </group>
      )}

      {/* ── KING ── */}
      {type === 'k' && (
        <group>
          <LatheMesh points={KING_PROFILE} segments={20} {...mat} />
          {/* Cross vertical */}
          <mesh position={[0, 0.76, 0]} castShadow>
            <boxGeometry args={[0.038, 0.17, 0.038]} />
            <meshStandardMaterial {...gold} />
          </mesh>
          {/* Cross horizontal */}
          <mesh position={[0, 0.80, 0]} castShadow>
            <boxGeometry args={[0.11, 0.038, 0.038]} />
            <meshStandardMaterial {...gold} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// ─────────────────────────────────────────────
// MAIN PIECES3D COMPONENT
// ─────────────────────────────────────────────

export const Pieces3D: React.FC = () => {
  const { game, gameState, selectCoord } = useGameStore();

  const { cols, rows, squareSize, offsetX, offsetZ } = useMemo(() => {
    let c = 8;
    let r = 8;
    if (game === 'xiangqi')      { c = 9; r = 10; }
    else if (game === 'gomoku')  { c = 15; r = 15; }

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

  const handlePieceClick = (e: any, coord: BoardCoordinate) => {
    e.stopPropagation();
    selectCoord(coord);
  };

  // ── CHESS ──
  if (game === 'chess') {
    const chess = new Chess(gameState.fen);
    const board = chess.board();

    return (
      <group>
        {board.map((row, rowIdx) =>
          row.map((piece, colIdx) => {
            if (!piece) return null;
            const engineCoord: BoardCoordinate = { x: colIdx, y: 7 - rowIdx };
            const [wx, wy, wz] = coordToWorld(engineCoord.x, engineCoord.y);
            const isWhite = piece.color === 'w';

            return (
              <group
                key={`chess-${colIdx}-${rowIdx}`}
                position={[wx, wy, wz]}
                onClick={(e) => handlePieceClick(e, engineCoord)}
              >
                <ChessPieceMesh type={piece.type} isWhite={isWhite} size={squareSize} />
              </group>
            );
          })
        )}
      </group>
    );
  }

  // ── GOMOKU ──
  if (game === 'gomoku') {
    const grid: (('p1' | 'p2') | null)[][] = gameState.grid;

    return (
      <group>
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (!cell) return null;
            const [wx, wy, wz] = coordToWorld(x, y);
            const isBlack = cell === 'p1';
            const r = squareSize * 0.41;

            return (
              <group key={`gomo-${x}-${y}`} position={[wx, wy + 0.04, wz]}>
                {/* Main stone */}
                <mesh castShadow receiveShadow>
                  <sphereGeometry args={[r, 24, 18]} />
                  <meshStandardMaterial
                    color={isBlack ? '#0f0f0f' : '#f8f4ec'}
                    roughness={isBlack ? 0.25 : 0.18}
                    metalness={isBlack ? 0.15 : 0.04}
                  />
                </mesh>
                {/* Subtle bottom flat */}
                <mesh position={[0, -r * 0.6, 0]} castShadow>
                  <cylinderGeometry args={[r * 0.65, r * 0.72, r * 0.08, 20]} />
                  <meshStandardMaterial
                    color={isBlack ? '#1a1a1a' : '#e8e3d8'}
                    roughness={0.5}
                  />
                </mesh>
              </group>
            );
          })
        )}
      </group>
    );
  }

  // ── CHECKERS ──
  if (game === 'checkers') {
    const board = gameState.board;

    return (
      <group>
        {board.map((row: any[], y: number) =>
          row.map((piece: any, x: number) => {
            if (!piece) return null;
            const [wx, wy, wz] = coordToWorld(x, y);
            const isP1  = piece.player === 'p1';
            const isKing = piece.type === 'king';
            const r = squareSize * 0.4;

            return (
              <group
                key={`chk-${x}-${y}`}
                position={[wx, wy + 0.06, wz]}
                onClick={(e) => handlePieceClick(e, { x, y })}
              >
                {/* Bottom disk */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[r, r * 1.05, 0.055, 24]} />
                  <meshStandardMaterial
                    color={isP1 ? '#d6c8b2' : '#2a1208'}
                    roughness={0.35}
                    metalness={0.08}
                  />
                </mesh>
                {/* Top disk (stacked) */}
                <mesh position={[0, 0.06, 0]} castShadow>
                  <cylinderGeometry args={[r * 0.95, r, 0.045, 24]} />
                  <meshStandardMaterial
                    color={isP1 ? '#c8baa4' : '#1e0d04'}
                    roughness={0.32}
                    metalness={0.06}
                  />
                </mesh>
                {/* Rim edge */}
                <mesh position={[0, 0.03, 0]} castShadow>
                  <torusGeometry args={[r, 0.016, 8, 24]} />
                  <meshStandardMaterial
                    color={isP1 ? '#a89880' : '#3d1a0a'}
                    roughness={0.4}
                  />
                </mesh>
                {/* King crown */}
                {isKing && (
                  <mesh position={[0, 0.11, 0]} castShadow>
                    <cylinderGeometry args={[r * 0.52, r * 0.56, 0.05, 20]} />
                    <meshStandardMaterial color="#e8b830" metalness={0.72} roughness={0.18} />
                  </mesh>
                )}
              </group>
            );
          })
        )}
      </group>
    );
  }

  // ── XIANGQI ──
  if (game === 'xiangqi') {
    const board = gameState.board;
    const labels: Record<string, { red: string; black: string }> = {
      general:  { red: '帥', black: '將' },
      advisor:  { red: '仕', black: '士' },
      elephant: { red: '相', black: '象' },
      horse:    { red: '傌', black: '馬' },
      chariot:  { red: '俥', black: '車' },
      cannon:   { red: '炮', black: '砲' },
      soldier:  { red: '兵', black: '卒' },
    };

    return (
      <group>
        {board.map((row: any[], y: number) =>
          row.map((piece: any, x: number) => {
            if (!piece) return null;
            const [wx, wy, wz] = coordToWorld(x, y);
            const isRed = piece.player === 'p1';
            const r = squareSize * 0.42;

            return (
              <group
                key={`xq-${x}-${y}`}
                position={[wx, wy + 0.05, wz]}
                onClick={(e) => handlePieceClick(e, { x, y })}
              >
                {/* Main puck */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[r, r * 1.05, 0.07, 24]} />
                  <meshStandardMaterial color="#f2e2c8" roughness={0.38} metalness={0.04} />
                </mesh>
                {/* Engraved rim ring */}
                <mesh position={[0, 0.038, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[r * 0.74, r * 0.82, 24]} />
                  <meshBasicMaterial color={isRed ? '#c71c1c' : '#1a2744'} />
                </mesh>
                {/* Piece colour dot */}
                <mesh position={[0, 0.038, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[r * 0.52, 20]} />
                  <meshBasicMaterial color={isRed ? '#e82020' : '#1e2f5e'} />
                </mesh>
                {/* Inner white circle (character placeholder) */}
                <mesh position={[0, 0.039, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[r * 0.30, 18]} />
                  <meshBasicMaterial color={isRed ? '#fff0e8' : '#c8d8ff'} />
                </mesh>
              </group>
            );
          })
        )}
      </group>
    );
  }

  return null;
};
