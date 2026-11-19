import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/stores/useGameStore';
import { BoardCoordinate } from '@/types/game';
import { Chess } from 'chess.js';

const BOARD_WIDTH = 5.2;

export const Pieces3D: React.FC = () => {
  const { game, gameState, selectCoord } = useGameStore();

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

  const handlePieceClick = (e: any, coord: BoardCoordinate) => {
    e.stopPropagation();
    selectCoord(coord);
  };

  // ---------------------------------------------
  // RENDER CHESS PIECES
  // ---------------------------------------------
  if (game === 'chess') {
    const chess = new Chess(gameState.fen);
    const board = chess.board(); // 8x8 row 0=rank 8 to row 7=rank 1

    return (
      <group>
        {board.map((row, rowIdx) =>
          row.map((piece, colIdx) => {
            if (!piece) return null;
            // chess.js row 0 is rank 8 (y=7), row 7 is rank 1 (y=0)
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

  // ---------------------------------------------
  // RENDER GOMOKU STONES
  // ---------------------------------------------
  if (game === 'gomoku') {
    const grid: (('p1' | 'p2') | null)[][] = gameState.grid;

    return (
      <group>
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (!cell) return null;
            const [wx, wy, wz] = coordToWorld(x, y);
            const isBlack = cell === 'p1';

            return (
              <mesh
                key={`gomo-${x}-${y}`}
                position={[wx, wy + 0.04, wz]}
                castShadow
                receiveShadow
              >
                <sphereGeometry args={[squareSize * 0.42, 24, 16]} />
                <meshStandardMaterial
                  color={isBlack ? '#111827' : '#f9fafb'}
                  roughness={isBlack ? 0.3 : 0.2}
                  metalness={isBlack ? 0.2 : 0.05}
                />
              </mesh>
            );
          })
        )}
      </group>
    );
  }

  // ---------------------------------------------
  // RENDER CHECKERS PIECES
  // ---------------------------------------------
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

            return (
              <group
                key={`chk-${x}-${y}`}
                position={[wx, wy + 0.06, wz]}
                onClick={(e) => handlePieceClick(e, { x, y })}
              >
                {/* Main draught disk */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[squareSize * 0.4, squareSize * 0.4, 0.1, 24]} />
                  <meshStandardMaterial
                    color={isP1 ? '#e2d5c3' : '#331d11'}
                    roughness={0.4}
                  />
                </mesh>

                {/* Crown for King */}
                {isKing && (
                  <mesh position={[0, 0.07, 0]} castShadow>
                    <cylinderGeometry args={[squareSize * 0.24, squareSize * 0.24, 0.05, 16]} />
                    <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.2} />
                  </mesh>
                )}
              </group>
            );
          })
        )}
      </group>
    );
  }

  // ---------------------------------------------
  // RENDER XIANGQI PIECES
  // ---------------------------------------------
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
            const label = isRed ? labelObj.red : labelObj.black;

            return (
              <group
                key={`xq-${x}-${y}`}
                position={[wx, wy + 0.05, wz]}
                onClick={(e) => handlePieceClick(e, { x, y })}
              >
                {/* Round wooden puck */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[squareSize * 0.42, squareSize * 0.42, 0.08, 24]} />
                  <meshStandardMaterial color="#f0dfc8" roughness={0.4} />
                </mesh>

                {/* Engraved rim */}
                <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[squareSize * 0.32, squareSize * 0.36, 24]} />
                  <meshBasicMaterial color={isRed ? '#b91c1c' : '#1e293b'} />
                </mesh>

                {/* Center marker / text representation */}
                <mesh position={[0, 0.043, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[squareSize * 0.22, 16]} />
                  <meshBasicMaterial color={isRed ? '#dc2626' : '#0f172a'} />
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

// ---------------------------------------------
// CHESS PIECE PROCEDURAL 3D MESHES
// ---------------------------------------------
const ChessPieceMesh: React.FC<{ type: string; isWhite: boolean; size: number }> = ({
  type,
  isWhite,
  size,
}) => {
  const color = isWhite ? '#f7f4ea' : '#291811';
  const roughness = isWhite ? 0.3 : 0.4;
  const metalness = isWhite ? 0.05 : 0.15;
  const scale = size * 1.5;

  return (
    <group scale={[scale, scale, scale]}>
      {/* Base pedestal for all pieces */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.08, 16]} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
      </mesh>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.08, 16]} />
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
      </mesh>

      {/* Piece Body */}
      {type === 'p' && (
        <group>
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.15, 0.16, 16]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[0, 0.36, 0]} castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
        </group>
      )}

      {type === 'r' && (
        <group>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.16, 0.24, 16]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[0, 0.44, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.14, 0.1, 16]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
        </group>
      )}

      {type === 'n' && (
        <group>
          <mesh position={[0, 0.28, 0]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.16, 0.26, 0.24]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[0, 0.44, 0.04]} castShadow>
            <coneGeometry args={[0.12, 0.18, 16]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
        </group>
      )}

      {type === 'b' && (
        <group>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 0.28, 16]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[0, 0.48, 0]} castShadow>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
        </group>
      )}

      {type === 'q' && (
        <group>
          <mesh position={[0, 0.34, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.17, 0.36, 16]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[0, 0.56, 0]} castShadow>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[0, 0.66, 0]} castShadow>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      )}

      {type === 'k' && (
        <group>
          <mesh position={[0, 0.36, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.18, 0.4, 16]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[0.18, 0.08, 0.18]} />
            <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
          </mesh>
          {/* King Crown Cross */}
          <mesh position={[0, 0.69, 0]} castShadow>
            <boxGeometry args={[0.04, 0.12, 0.04]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.1, 0.04, 0.04]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
};
