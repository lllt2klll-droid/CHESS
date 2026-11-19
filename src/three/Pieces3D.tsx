import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/stores/useGameStore';
import { BoardCoordinate } from '@/types/game';
import { Chess } from 'chess.js';

const BOARD_WIDTH = 5.2;

// ─────────────────────────────────────────────────────────────
// Cache for Xiangqi Traditional Calligraphy Textures
// ─────────────────────────────────────────────────────────────
const xiangqiTextureCache = new Map<string, THREE.CanvasTexture>();

function getXiangqiTexture(char: string, isRed: boolean): THREE.CanvasTexture {
  const key = `${char}-${isRed}`;
  if (xiangqiTextureCache.has(key)) return xiangqiTextureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Smooth radial gradient for ivory wood face
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 126);
  grad.addColorStop(0, '#fffbf2');
  grad.addColorStop(0.8, '#f5e4c6');
  grad.addColorStop(1, '#dec198');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 126, 0, Math.PI * 2);
  ctx.fill();

  const strokeColor = isRed ? '#b91c1c' : '#1e293b';
  const charColor = isRed ? '#dc2626' : '#0f172a';

  // Outer engraved ring
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(128, 128, 114, 0, Math.PI * 2);
  ctx.stroke();

  // Inner decorative ring
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(128, 128, 104, 0, Math.PI * 2);
  ctx.stroke();

  // Traditional Calligraphy Character
  ctx.fillStyle = charColor;
  ctx.font = 'bold 118px "Kaiti", "STKaiti", "KaiTi", "SimSun", "Noto Serif SC", serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, 128, 134);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  xiangqiTextureCache.set(key, texture);
  return texture;
}

// ─────────────────────────────────────────────────────────────
// Staunton Profile Geometries for Chess Pieces (Lathe)
// ─────────────────────────────────────────────────────────────
function makeLathe(profile: [number, number][]): THREE.Vector2[] {
  return profile.map(([r, y]) => new THREE.Vector2(r, y));
}

// Universal Staunton Tiered Plinth Base
const BASE_PROFILE: [number, number][] = [
  [0.00, 0.000],
  [0.21, 0.000],
  [0.23, 0.015],
  [0.23, 0.035],
  [0.20, 0.055],
  [0.18, 0.075],
  [0.15, 0.090],
];

// PAWN: Broad base, slim tapered waist, beaded neck, spherical ball head
const PAWN_PROFILE = makeLathe([
  ...BASE_PROFILE,
  [0.13, 0.12],
  [0.10, 0.17],
  [0.08, 0.22],
  [0.07, 0.27],
  [0.10, 0.29], // collar ring
  [0.09, 0.31],
  [0.07, 0.32],
  [0.11, 0.34], // head sphere
  [0.125, 0.375],
  [0.11, 0.41],
  [0.08, 0.435],
  [0.00, 0.44],
]);

// ROOK: Castled fortress tower with parapet
const ROOK_PROFILE = makeLathe([
  ...BASE_PROFILE,
  [0.14, 0.12],
  [0.13, 0.18],
  [0.12, 0.25],
  [0.12, 0.31],
  [0.14, 0.33], // relief torus
  [0.13, 0.34],
  [0.16, 0.36], // parapet flare
  [0.17, 0.48], // top tower wall
  [0.14, 0.48], // inner crenellation rim
  [0.12, 0.40], // inner cavity floor
  [0.00, 0.40],
]);

// BISHOP: Slender waist, ornate double collar, mitre dome, finial ball
const BISHOP_PROFILE = makeLathe([
  ...BASE_PROFILE,
  [0.13, 0.13],
  [0.10, 0.19],
  [0.08, 0.26],
  [0.075, 0.31],
  [0.105, 0.33], // lower collar
  [0.08, 0.345],
  [0.10, 0.36],  // upper collar
  [0.075, 0.37],
  [0.095, 0.40], // mitre base
  [0.11, 0.46],  // mitre bulge
  [0.09, 0.52],  // mitre taper
  [0.05, 0.56],
  [0.035, 0.575], // finial neck
  [0.05, 0.595],  // finial ball
  [0.03, 0.615],
  [0.00, 0.62],
]);

// QUEEN: Regal flared stem, royal coronet cup, central orb
const QUEEN_PROFILE = makeLathe([
  ...BASE_PROFILE,
  [0.14, 0.13],
  [0.11, 0.20],
  [0.09, 0.28],
  [0.085, 0.34],
  [0.115, 0.365], // royal ring
  [0.09, 0.38],
  [0.11, 0.40],
  [0.095, 0.42],
  [0.11, 0.46],  // coronet flare
  [0.14, 0.53],
  [0.16, 0.60],  // coronet rim
  [0.14, 0.60],
  [0.10, 0.54],  // inner cup
  [0.00, 0.54],
]);

// KING: Majestic regal plinth, broad shoulders, concave waist, coronet platform
const KING_PROFILE = makeLathe([
  ...BASE_PROFILE,
  [0.14, 0.14],
  [0.11, 0.22],
  [0.095, 0.31],
  [0.09, 0.38],
  [0.125, 0.405], // upper collar
  [0.10, 0.42],
  [0.12, 0.44],
  [0.10, 0.46],
  [0.12, 0.51],  // flared chest
  [0.15, 0.58],  // coronet flare
  [0.17, 0.65],  // coronet lip
  [0.15, 0.67],  // crown dome
  [0.12, 0.69],
  [0.07, 0.705], // cross plinth
  [0.00, 0.705],
]);

// KNIGHT PEDESTAL BASE (Lathe)
const KNIGHT_BASE_PROFILE = makeLathe([
  ...BASE_PROFILE,
  [0.14, 0.11],
  [0.15, 0.13],
  [0.13, 0.145],
  [0.00, 0.145],
]);

interface LatheMeshProps {
  points: THREE.Vector2[];
  segments?: number;
  color: string;
  roughness: number;
  metalness: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

const LatheMesh: React.FC<LatheMeshProps> = ({
  points,
  segments = 24,
  color,
  roughness,
  metalness,
  castShadow = true,
  receiveShadow = true,
}) => {
  const geo = useMemo(() => {
    const g = new THREE.LatheGeometry(points, segments);
    g.computeVertexNormals();
    return g;
  }, [points, segments]);

  return (
    <mesh geometry={geo} castShadow={castShadow} receiveShadow={receiveShadow}>
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
};

// ─────────────────────────────────────────────────────────────
// Authentic Staunton Chess Piece Mesh
// ─────────────────────────────────────────────────────────────
const ChessPieceMesh: React.FC<{ type: string; isWhite: boolean; size: number }> = ({
  type,
  isWhite,
  size,
}) => {
  const scale = size * 1.62;

  // Authentic Ivory Porcelain (White) & Polished Ebonized Rosewood (Black)
  const mat = useMemo(
    () => ({
      color: isWhite ? '#fcf9ee' : '#1e120a',
      roughness: isWhite ? 0.2 : 0.3,
      metalness: isWhite ? 0.02 : 0.06,
    }),
    [isWhite]
  );

  const gold = useMemo(
    () => ({
      color: '#f5c542',
      roughness: 0.18,
      metalness: 0.78,
    }),
    []
  );

  return (
    <group scale={[scale, scale, scale]}>
      {/* ── PAWN ── */}
      {type === 'p' && <LatheMesh points={PAWN_PROFILE} segments={22} {...mat} />}

      {/* ── ROOK (Tower + 4 Crenelated Battlements) ── */}
      {type === 'r' && (
        <group>
          <LatheMesh points={ROOK_PROFILE} segments={22} {...mat} />
          {/* 4 Battlement notches on top rim */}
          {[0, 1, 2, 3].map((i) => {
            const angle = (i / 4) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.145, 0.455, Math.sin(angle) * 0.145]}
                castShadow
              >
                <boxGeometry args={[0.075, 0.08, 0.075]} />
                <meshStandardMaterial {...mat} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* ── KNIGHT (Authentic Sculpted Horse Head) ── */}
      {type === 'n' && (
        <group>
          {/* Turned plinth base */}
          <LatheMesh points={KNIGHT_BASE_PROFILE} segments={20} {...mat} />

          {/* Horse Neck & Body */}
          <mesh position={[0, 0.24, 0.015]} rotation={[0.26, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.13, 0.21, 14]} />
            <meshStandardMaterial {...mat} />
          </mesh>

          {/* Flowing Mane Crest on back of neck */}
          <mesh position={[0, 0.28, -0.065]} rotation={[-0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.05, 0.18, 0.07]} />
            <meshStandardMaterial {...mat} />
          </mesh>

          {/* Horse Head & Jaw */}
          <mesh position={[0, 0.38, 0.05]} rotation={[-0.15, 0, 0]} castShadow>
            <boxGeometry args={[0.13, 0.14, 0.18]} />
            <meshStandardMaterial {...mat} />
          </mesh>

          {/* Tapered Muzzle / Snout */}
          <mesh position={[0, 0.34, 0.135]} rotation={[0.18, 0, 0]} castShadow>
            <boxGeometry args={[0.095, 0.08, 0.11]} />
            <meshStandardMaterial {...mat} />
          </mesh>

          {/* Chin & Mouth cleft */}
          <mesh position={[0, 0.31, 0.09]} castShadow>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial {...mat} />
          </mesh>

          {/* Left Ear */}
          <mesh position={[0.045, 0.47, 0.01]} rotation={[0.1, 0, 0.2]} castShadow>
            <coneGeometry args={[0.025, 0.08, 8]} />
            <meshStandardMaterial {...mat} />
          </mesh>

          {/* Right Ear */}
          <mesh position={[-0.045, 0.47, 0.01]} rotation={[0.1, 0, -0.2]} castShadow>
            <coneGeometry args={[0.025, 0.08, 8]} />
            <meshStandardMaterial {...mat} />
          </mesh>
        </group>
      )}

      {/* ── BISHOP (Mitre dome + Mitre Cut + Finial) ── */}
      {type === 'b' && (
        <group>
          <LatheMesh points={BISHOP_PROFILE} segments={22} {...mat} />
          {/* Characteristic angled mitre cut groove */}
          <mesh position={[0.06, 0.48, 0.06]} rotation={[0.4, 0.4, 0.2]}>
            <boxGeometry args={[0.03, 0.12, 0.03]} />
            <meshStandardMaterial color={isWhite ? '#d8ceb8' : '#0f0804'} />
          </mesh>
        </group>
      )}

      {/* ── QUEEN (Coronet Petals + Central Gold Orb) ── */}
      {type === 'q' && (
        <group>
          <LatheMesh points={QUEEN_PROFILE} segments={24} {...mat} />
          {/* 8 Crown Pearl Points around Coronet Rim */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.15, 0.62, Math.sin(angle) * 0.15]}
                castShadow
              >
                <sphereGeometry args={[0.022, 10, 10]} />
                <meshStandardMaterial {...gold} />
              </mesh>
            );
          })}
          {/* Center Royal Gold Orb */}
          <mesh position={[0, 0.66, 0]} castShadow>
            <sphereGeometry args={[0.042, 14, 14]} />
            <meshStandardMaterial {...gold} />
          </mesh>
        </group>
      )}

      {/* ── KING (Regal Coronet + Imperial Cross) ── */}
      {type === 'k' && (
        <group>
          <LatheMesh points={KING_PROFILE} segments={24} {...mat} />

          {/* Finial Cross Plinth */}
          <mesh position={[0, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.055, 0.03, 12]} />
            <meshStandardMaterial {...gold} />
          </mesh>

          {/* Imperial Cross Vertical Beam */}
          <mesh position={[0, 0.78, 0]} castShadow>
            <boxGeometry args={[0.034, 0.15, 0.034]} />
            <meshStandardMaterial {...gold} />
          </mesh>

          {/* Imperial Cross Horizontal Bar */}
          <mesh position={[0, 0.81, 0]} castShadow>
            <boxGeometry args={[0.10, 0.034, 0.034]} />
            <meshStandardMaterial {...gold} />
          </mesh>

          {/* Central Cross Jewel */}
          <mesh position={[0, 0.81, 0]} castShadow>
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshStandardMaterial color="#ef4444" roughness={0.1} metalness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN PIECES3D COMPONENT (All 4 Games)
// ─────────────────────────────────────────────────────────────
export const Pieces3D: React.FC = () => {
  const { game, gameState, selectCoord } = useGameStore();

  const { cols, rows, squareSize, offsetX, offsetZ } = useMemo(() => {
    let c = 8;
    let r = 8;
    if (game === 'xiangqi') {
      c = 9;
      r = 10;
    } else if (game === 'gomoku') {
      c = 15;
      r = 15;
    }

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

  // ── 1. CHESS ──
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

  // ── 2. GOMOKU (Authentic Bi-convex Yunzi Stones) ──
  if (game === 'gomoku') {
    const grid: (('p1' | 'p2') | null)[][] = gameState.grid;

    return (
      <group>
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (!cell) return null;
            const [wx, wy, wz] = coordToWorld(x, y);
            const isBlack = cell === 'p1';
            const r = squareSize * 0.43;

            return (
              <group key={`gomo-${x}-${y}`} position={[wx, wy + 0.035, wz]}>
                {/* Upper convex dome */}
                <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
                  <sphereGeometry args={[r, 26, 14, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
                  <meshStandardMaterial
                    color={isBlack ? '#141416' : '#fdfbf7'}
                    roughness={isBlack ? 0.18 : 0.14}
                    metalness={isBlack ? 0.15 : 0.02}
                  />
                </mesh>
                {/* Lower convex dome */}
                <mesh
                  position={[0, 0.015, 0]}
                  rotation={[Math.PI, 0, 0]}
                  castShadow
                  receiveShadow
                >
                  <sphereGeometry args={[r, 26, 14, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
                  <meshStandardMaterial
                    color={isBlack ? '#141416' : '#fdfbf7'}
                    roughness={isBlack ? 0.18 : 0.14}
                    metalness={isBlack ? 0.15 : 0.02}
                  />
                </mesh>
              </group>
            );
          })
        )}
      </group>
    );
  }

  // ── 3. CHECKERS (Concentric Grooved Tournament Draughts) ──
  if (game === 'checkers') {
    const board = gameState.board;

    return (
      <group>
        {board.map((row: any[], y: number) =>
          row.map((piece: any, x: number) => {
            if (!piece) return null;
            const [wx, wy, wz] = coordToWorld(x, y);
            const isP1 = piece.player === 'p1';
            const isKing = piece.type === 'king';
            const r = squareSize * 0.42;

            return (
              <group
                key={`chk-${x}-${y}`}
                position={[wx, wy + 0.05, wz]}
                onClick={(e) => handlePieceClick(e, { x, y })}
              >
                {/* Main draught piece with beveled edge */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[r * 0.94, r, 0.08, 28]} />
                  <meshStandardMaterial
                    color={isP1 ? '#e8d9c2' : '#281308'}
                    roughness={0.3}
                    metalness={0.06}
                  />
                </mesh>

                {/* Concentric relief ring 1 */}
                <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[r * 0.65, r * 0.74, 28]} />
                  <meshStandardMaterial
                    color={isP1 ? '#c8b69c' : '#452210'}
                    roughness={0.4}
                  />
                </mesh>

                {/* Concentric relief ring 2 */}
                <mesh position={[0, 0.043, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[r * 0.35, r * 0.44, 28]} />
                  <meshStandardMaterial
                    color={isP1 ? '#c8b69c' : '#452210'}
                    roughness={0.4}
                  />
                </mesh>

                {/* King Crown Ornament */}
                {isKing && (
                  <group position={[0, 0.045, 0]}>
                    <mesh position={[0, 0.04, 0]} castShadow>
                      <cylinderGeometry args={[r * 0.42, r * 0.48, 0.06, 20]} />
                      <meshStandardMaterial color="#f5c542" metalness={0.8} roughness={0.18} />
                    </mesh>
                    <mesh position={[0, 0.08, 0]} castShadow>
                      <sphereGeometry args={[r * 0.14, 12, 12]} />
                      <meshStandardMaterial color="#f5c542" metalness={0.8} roughness={0.18} />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })
        )}
      </group>
    );
  }

  // ── 4. XIANGQI (Authentic Traditional Calligraphy Seal Puck) ──
  if (game === 'xiangqi') {
    const board = gameState.board;
    const labels: Record<string, { red: string; black: string }> = {
      general: { red: '帥', black: '將' },
      advisor: { red: '仕', black: '士' },
      elephant: { red: '相', black: '象' },
      horse: { red: '傌', black: '馬' },
      chariot: { red: '俥', black: '車' },
      cannon: { red: '炮', black: '砲' },
      soldier: { red: '兵', black: '卒' },
    };

    return (
      <group>
        {board.map((row: any[], y: number) =>
          row.map((piece: any, x: number) => {
            if (!piece) return null;
            const [wx, wy, wz] = coordToWorld(x, y);
            const isRed = piece.player === 'p1';
            const labelObj = labels[piece.type] || { red: '?', black: '?' };
            const char = isRed ? labelObj.red : labelObj.black;
            const r = squareSize * 0.43;
            const texture = getXiangqiTexture(char, isRed);

            return (
              <group
                key={`xq-${x}-${y}`}
                position={[wx, wy + 0.04, wz]}
                onClick={(e) => handlePieceClick(e, { x, y })}
              >
                {/* Wooden Puck Base Cylinder */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[r * 0.96, r, 0.08, 32]} />
                  <meshStandardMaterial
                    color="#f5e6cb"
                    roughness={0.35}
                    metalness={0.04}
                  />
                </mesh>

                {/* Top Face with Traditional Calligraphy Canvas Texture */}
                <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[r * 0.95, 32]} />
                  <meshBasicMaterial map={texture} />
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
