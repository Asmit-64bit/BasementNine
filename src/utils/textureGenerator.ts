import * as THREE from 'three';

// Cache generated textures so we don't recreate canvases every render
const textureCache: Record<string, THREE.CanvasTexture> = {};

function createTexture(
  key: string,
  width: number,
  height: number,
  repeatX: number,
  repeatY: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  if (textureCache[key]) {
    return textureCache[key];
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    draw(ctx, width, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.needsUpdate = true;

  textureCache[key] = texture;
  return texture;
}

/** Scatters faint speckle/grime dots across a region for a worn, less-uniform surface. */
function addGrime(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number,
  color: string,
  seed = 1,
): void {
  // Deterministic pseudo-random so the cached texture is stable across regenerations.
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i += 1) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 0.5 + rand() * 1.8;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.04 + rand() * 0.1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ----------------------------------------------------
// LEVEL 1: LABORATORY TEXTURES
// ----------------------------------------------------

/** Polished laboratory tile floor with subtle grout lines and grime */
export function getLabFloorTexture(): THREE.CanvasTexture {
  return createTexture('lab_floor', 512, 512, 10, 10, (ctx, w, h) => {
    // Base tile color (light teal-grey)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);

    // Grid tiles (4x4 sub-grid per patch)
    const tileSize = w / 4;
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        const px = x * tileSize;
        const py = y * tileSize;

        // Tile body gradient
        const grad = ctx.createLinearGradient(px, py, px + tileSize, py + tileSize);
        grad.addColorStop(0, (x + y) % 2 === 0 ? '#334155' : '#293548');
        grad.addColorStop(1, (x + y) % 2 === 0 ? '#1e293b' : '#182232');
        ctx.fillStyle = grad;
        ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);

        // Subtle specular highlight on tile edge
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 3, py + 3, tileSize - 6, tileSize - 6);
      }
    }

    // Grout lines
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    for (let i = 0; i <= w; i += tileSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }

    // Worn scuff streaks + grime for a less sterile, lived-in floor
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.lineWidth = 2;
    for (let s = 0; s < 5; s += 1) {
      const sx = (s * 97) % w;
      const sy = (s * 149) % h;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 40 + s * 6, sy + 14);
      ctx.stroke();
    }
    addGrime(ctx, w, h, 220, '#000000', 11);
    addGrime(ctx, w, h, 60, '#94a3b8', 23);
  });
}

/** High-tech modular laboratory wall with panels, rivets, and warning decals */
export function getLabWallTexture(): THREE.CanvasTexture {
  return createTexture('lab_wall', 512, 512, 6, 2, (ctx, w, h) => {
    // Main Wall Base (clean scientific steel-blue)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);

    // Left/Right Panel Division
    const panelWidth = w / 2;
    for (let p = 0; p < 2; p++) {
      const px = p * panelWidth;
      const grad = ctx.createLinearGradient(px, 0, px + panelWidth, h);
      grad.addColorStop(0, '#334155');
      grad.addColorStop(0.5, '#475569');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(px + 6, 6, panelWidth - 12, h - 12);

      // Inner Panel border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 10, 10, panelWidth - 20, h - 20);

      // Rivets in corners
      ctx.fillStyle = '#0f172a';
      const corners = [
        [px + 16, 16],
        [px + panelWidth - 16, 16],
        [px + 16, h - 16],
        [px + panelWidth - 16, h - 16],
        [px + 16, h / 2],
        [px + panelWidth - 16, h / 2],
      ];
      for (const [cx, cy] of corners) {
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(cx - 1, cy - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
      }

      // Middle vent lines
      ctx.fillStyle = '#0f172a';
      for (let v = 0; v < 8; v++) {
        ctx.fillRect(px + 30, 80 + v * 12, panelWidth - 60, 4);
      }
    }

    // Top & Bottom trim strip
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, 8);
    ctx.fillRect(0, h - 8, w, 8);

    // Cyan accent light bar at top
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(20, 14, w - 40, 4);

    // Small stenciled ID plate (subtle, breaks up the panel monotony)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('LAB-STRUCT // REV.4', w / 2 - 60, h - 26);

    addGrime(ctx, w, h, 140, '#000000', 41);
    addGrime(ctx, w, h, 40, '#5eead4', 53);
  });
}

// ----------------------------------------------------
// LEVEL 2: SERVER ROOM TEXTURES
// ----------------------------------------------------

/** Futuristic server raised floor tiles with perforated ventilation and cyan traces */
export function getServerFloorTexture(): THREE.CanvasTexture {
  return createTexture('server_floor', 512, 512, 8, 8, (ctx, w, h) => {
    // Dark metallic background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // 2x2 tile grid
    const s = w / 2;
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        const px = x * s;
        const py = y * s;

        // Tile face
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + 4, py + 4, s - 8, s - 8);

        // Perforated ventilation dots grid
        ctx.fillStyle = '#020617';
        for (let dx = px + 18; dx < px + s - 18; dx += 14) {
          for (let dy = py + 18; dy < py + s - 18; dy += 14) {
            ctx.beginPath();
            ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Cyan Glowing corner brackets
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(px + 10, py + 22);
        ctx.lineTo(px + 10, py + 10);
        ctx.lineTo(px + 22, py + 10);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(px + s - 10, py + s - 22);
        ctx.lineTo(px + s - 10, py + s - 10);
        ctx.lineTo(px + s - 22, py + s - 10);
        ctx.stroke();
      }
    }

    // Outer grid line
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(2, 2, w - 4, h - 4);

    // Faint diagonal "data flow" traces crossing the tile seams
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let d = -h; d < w + h; d += 28) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + h, h);
      ctx.stroke();
    }
    addGrime(ctx, w, h, 90, '#00e5ff', 71);
    addGrime(ctx, w, h, 100, '#000000', 83);
  });
}

/** Server Room Wall with dark carbon plating, circuit traces, and server conduits */
export function getServerWallTexture(): THREE.CanvasTexture {
  return createTexture('server_wall', 512, 512, 6, 2, (ctx, w, h) => {
    // Dark cyber wall base
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, w, h);

    // Vertical server housing panels
    const pw = w / 2;
    for (let p = 0; p < 2; p++) {
      const px = p * pw;

      ctx.fillStyle = '#111827';
      ctx.fillRect(px + 6, 8, pw - 12, h - 16);

      // Server rack grill
      ctx.fillStyle = '#030712';
      ctx.fillRect(px + 16, 24, pw - 32, h - 48);

      // Cyan circuit traces along the panels
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 24, 40);
      ctx.lineTo(px + pw / 2, 80);
      ctx.lineTo(px + pw / 2, h - 80);
      ctx.lineTo(px + pw - 24, h - 40);
      ctx.stroke();

      // Glowing data node circles
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(px + 24, 40, 4, 0, Math.PI * 2);
      ctx.arc(px + pw / 2, 80, 3, 0, Math.PI * 2);
      ctx.arc(px + pw / 2, h - 80, 3, 0, Math.PI * 2);
      ctx.arc(px + pw - 24, h - 40, 4, 0, Math.PI * 2);
      ctx.fill();

      // Blinking server-status LED row for that "live rack" feel
      const ledColors = ['#22c55e', '#22c55e', '#facc15', '#00e5ff', '#22c55e', '#ef4444'];
      for (let l = 0; l < ledColors.length; l += 1) {
        ctx.fillStyle = ledColors[l];
        ctx.beginPath();
        ctx.arc(px + 30 + l * 14, h / 2 + 40, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Top and bottom heavy framing
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, 12);
    ctx.fillRect(0, h - 12, w, 12);

    addGrime(ctx, w, h, 120, '#000000', 97);
  });
}

// ----------------------------------------------------
// LEVEL 4: DEBUG WING TEXTURES
// ----------------------------------------------------

/** Deep violet/purple glitching hex grid tiles with neon magenta highlights */
export function getDebugFloorTexture(): THREE.CanvasTexture {
  return createTexture('debug_floor', 512, 512, 8, 8, (ctx, w, h) => {
    ctx.fillStyle = '#0a0518';
    ctx.fillRect(0, 0, w, h);

    const s = w / 2;
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        const px = x * s;
        const py = y * s;

        ctx.fillStyle = '#170c30';
        ctx.fillRect(px + 4, py + 4, s - 8, s - 8);

        // Purple memory grid lines
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 10, py + 10, s - 20, s - 20);

        // Neon magenta center dot
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(px + s / 2, py + s / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
  });
}

/** Dark violet matrix panel with purple circuit traces and memory hex dumps */
export function getDebugWallTexture(): THREE.CanvasTexture {
  return createTexture('debug_wall', 512, 512, 6, 2, (ctx, w, h) => {
    ctx.fillStyle = '#0d0720';
    ctx.fillRect(0, 0, w, h);

    const pw = w / 2;
    for (let p = 0; p < 2; p++) {
      const px = p * pw;
      ctx.fillStyle = '#1e1140';
      ctx.fillRect(px + 6, 8, pw - 12, h - 16);

      // Inner bevel
      ctx.strokeStyle = '#3b1c7a';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 12, 14, pw - 24, h - 28);

      // Memory dump text
      ctx.fillStyle = 'rgba(192, 132, 252, 0.7)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('0x7FFF // HEAP_ERR', px + 20, 45);
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
      ctx.fillText('PTR: 0x00F4A99B', px + 20, 68);
      ctx.fillText('STK: 0xDEADBEEF', px + 20, 88);

      // Neon purple vertical conduit
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(px + pw - 24, 30, 4, h - 60);
    }

    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, w, 10);
    ctx.fillRect(0, h - 10, w, 10);
  });
}

// ----------------------------------------------------
// LEVEL 5: THE NEXUS TEXTURES
// ----------------------------------------------------

/** Obsidian cosmic floor with radiant gold geometric tessellation */
export function getNexusFloorTexture(): THREE.CanvasTexture {
  return createTexture('nexus_floor', 512, 512, 8, 8, (ctx, w, h) => {
    ctx.fillStyle = '#050300';
    ctx.fillRect(0, 0, w, h);

    const s = w / 2;
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        const px = x * s;
        const py = y * s;

        // Dark obsidian stone plate
        ctx.fillStyle = '#1c1508';
        ctx.fillRect(px + 4, py + 4, s - 8, s - 8);

        // Gold concentric quantum circles
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px + s / 2, py + s / 2, s / 3, 0, Math.PI * 2);
        ctx.stroke();

        // Golden center diamond
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(px + s / 2, py + s / 2 - 8);
        ctx.lineTo(px + s / 2 + 8, py + s / 2);
        ctx.lineTo(px + s / 2, py + s / 2 + 8);
        ctx.lineTo(px + s / 2 - 8, py + s / 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
  });
}

/** Black mirror quantum plating with gold circuitry and quantum glyphs */
export function getNexusWallTexture(): THREE.CanvasTexture {
  return createTexture('nexus_wall', 512, 512, 6, 2, (ctx, w, h) => {
    ctx.fillStyle = '#0a0702';
    ctx.fillRect(0, 0, w, h);

    const pw = w / 2;
    for (let p = 0; p < 2; p++) {
      const px = p * pw;
      ctx.fillStyle = '#241a07';
      ctx.fillRect(px + 8, 8, pw - 16, h - 16);

      // Gold circuitry lines
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px + 20, 30);
      ctx.lineTo(px + pw / 2, 70);
      ctx.lineTo(px + pw / 2, h - 70);
      ctx.lineTo(px + pw - 20, h - 30);
      ctx.stroke();

      // Quantum Glyph Rune Text
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Ω // NEXUS_CORE', px + 24, 45);

      // Golden nodes
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(px + 20, 30, 5, 0, Math.PI * 2);
      ctx.arc(px + pw / 2, 70, 4, 0, Math.PI * 2);
      ctx.arc(px + pw / 2, h - 70, 4, 0, Math.PI * 2);
      ctx.arc(px + pw - 20, h - 30, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, w, 10);
    ctx.fillRect(0, h - 10, w, 10);
  });
}

/** Standard industrial ceiling tile texture */
export function getCeilingTexture(): THREE.CanvasTexture {
  return createTexture('ceiling_tile', 512, 512, 8, 8, (ctx, w, h) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const s = w / 2;
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        const px = x * s;
        const py = y * s;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 2, py + 2, s - 4, s - 4);

        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 4, py + 4, s - 8, s - 8);
      }
    }

    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, w, h);
  });
}
