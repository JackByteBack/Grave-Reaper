// Shadow Vault screen — spend Shadows on permanent meta-upgrades.
//
// Opened from the title screen. Reads/writes the persistent vault via
// systems/vault.js, so any purchase here strengthens every future run.
// Works with keyboard (↑↓ select, Enter buy, Esc back) and touch/mouse
// (tap a row to buy it, tap the Back button to leave).

import { isJustPressed, isConfirm } from '../engine/input.js';
import { VAULT_UPGRADES } from '../data/vault.js';
import { getShadows, getLevel, nextCost, canAfford, buyUpgrade } from '../systems/vault.js';
import { playLevelUp, playHit } from '../engine/audio.js';

const JP = "'Yu Gothic', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif";

const LIST_X = 40;
const LIST_W = 400;
const LIST_Y = 58;
const ROW_H = 29;

export class VaultScreen {
  constructor() {
    this.sel = 0;
    this.flash = 0;        // +1 = bought, -1 = denied
    this.flashTimer = 0;
    this.backBtnRect = null;
    this.rowRects = [];
  }

  // Called each time the screen is opened, to reset the cursor/feedback.
  reset() {
    this.sel = 0;
    this.flash = 0;
    this.flashTimer = 0;
  }

  update(dt) {
    if (this.flashTimer > 0) this.flashTimer -= dt;

    const n = VAULT_UPGRADES.length;
    if (isJustPressed('ArrowUp')   || isJustPressed('KeyW')) this.sel = (this.sel - 1 + n) % n;
    if (isJustPressed('ArrowDown') || isJustPressed('KeyS')) this.sel = (this.sel + 1) % n;

    if (isJustPressed('Escape') || isJustPressed('Backspace')) return 'back';
    if (isConfirm()) this._buy(this.sel);

    return null;
  }

  _buy(idx) {
    const def = VAULT_UPGRADES[idx];
    if (buyUpgrade(def)) {
      this.flash = 1;  this.flashTimer = 0.5; playLevelUp();
    } else {
      this.flash = -1; this.flashTimer = 0.5; playHit();
    }
  }

  // Map a tap (logical 480×270 coords) onto the Back button or an upgrade row.
  handleTap(lx, ly) {
    const b = this.backBtnRect;
    if (b && lx >= b.x && lx <= b.x + b.w && ly >= b.y && ly <= b.y + b.h) return 'back';
    for (let i = 0; i < this.rowRects.length; i++) {
      const r = this.rowRects[i];
      if (lx >= r.x && lx <= r.x + r.w && ly >= r.y && ly <= r.y + r.h) {
        this.sel = i;
        this._buy(i);
        return null;
      }
    }
    return null;
  }

  draw(ctx) {
    const W = 480, H = 270;
    ctx.save();

    // Dim, purple-tinted backdrop over the scrolling title world.
    ctx.fillStyle = 'rgba(4,2,10,0.88)';
    ctx.fillRect(0, 0, W, H);

    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c8a2ff';
    ctx.font = `bold 20px ${JP}`;
    ctx.shadowColor = '#7722cc';
    ctx.shadowBlur = 14;
    ctx.fillText('⚰ SHADOW VAULT ⚰', W / 2, 30);
    ctx.shadowBlur = 0;

    // Balance
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffd24a';
    ctx.font = `bold 13px ${JP}`;
    ctx.fillText(`👻 Shadows: ${getShadows()}`, W - 16, 48);

    // Upgrade rows
    this.rowRects = [];
    for (let i = 0; i < VAULT_UPGRADES.length; i++) {
      const def = VAULT_UPGRADES[i];
      const y = LIST_Y + i * ROW_H;
      const h = ROW_H - 4;
      const sel = i === this.sel;
      const lv = getLevel(def.id);
      const cost = nextCost(def);
      const maxed = cost === null;
      const afford = canAfford(def);

      this.rowRects.push({ x: LIST_X, y, w: LIST_W, h });

      // Row frame
      ctx.fillStyle = sel ? 'rgba(60,30,90,0.92)' : 'rgba(16,12,28,0.82)';
      ctx.fillRect(LIST_X, y, LIST_W, h);
      ctx.strokeStyle = sel ? '#b070ff' : '#332244';
      ctx.lineWidth = sel ? 2 : 1;
      ctx.strokeRect(LIST_X + 0.5, y + 0.5, LIST_W - 1, h - 1);

      // Top line: icon + name
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = `12px ${JP}`;
      ctx.fillText(def.icon, LIST_X + 8, y + 13);
      ctx.fillStyle = sel ? '#ffe9b0' : '#cccddc';
      ctx.font = `bold 12px ${JP}`;
      ctx.fillText(def.name, LIST_X + 26, y + 13);

      // Bottom line: effect at the next level (or final level if maxed)
      ctx.fillStyle = '#9088a8';
      ctx.font = `9px ${JP}`;
      ctx.fillText(maxed ? `${def.desc(def.maxLevel)} (max)` : def.desc(lv + 1), LIST_X + 26, y + 23);

      // Level pips (top-right)
      const pipX = LIST_X + LIST_W - 142;
      for (let p = 0; p < def.maxLevel; p++) {
        ctx.fillStyle = p < lv ? '#b070ff' : '#3a3450';
        ctx.fillRect(pipX + p * 11, y + 4, 8, 8);
      }

      // Cost / MAX (right, vertically centered)
      ctx.textAlign = 'right';
      ctx.font = `bold 11px ${JP}`;
      if (maxed) {
        ctx.fillStyle = '#66dd88';
        ctx.fillText('MAX', LIST_X + LIST_W - 10, y + 17);
      } else {
        ctx.fillStyle = afford ? '#ffd24a' : '#aa5555';
        ctx.fillText(`${cost} 👻`, LIST_X + LIST_W - 10, y + 17);
      }
    }

    // Purchase / denial feedback
    if (this.flashTimer > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.flashTimer * 2.5);
      ctx.textAlign = 'center';
      ctx.font = `bold 12px ${JP}`;
      if (this.flash > 0) {
        ctx.fillStyle = '#7dff9b';
        ctx.fillText('✦ Upgrade unlocked! ✦', W / 2, 244);
      } else {
        ctx.fillStyle = '#ff7d7d';
        ctx.fillText('✦ Not enough Shadows ✦', W / 2, 244);
      }
      ctx.restore();
    }

    // Back button (left) + control hint (center)
    const bw = 96, bh = 18, bx = 16, by = 246;
    this.backBtnRect = { x: bx, y: by, w: bw, h: bh };
    ctx.fillStyle = 'rgba(30,12,46,0.92)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#9b59d0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d9b3ff';
    ctx.font = `bold 10px ${JP}`;
    ctx.fillText('← Back  [Esc]', bx + bw / 2, by + 13);

    ctx.fillStyle = '#8a7fa0';
    ctx.font = `10px ${JP}`;
    ctx.fillText('[ ↑ ↓ / W S ] Select    [ Enter ] Buy    (or tap a row)', W / 2 + 40, by + 13);

    ctx.restore();
  }
}
