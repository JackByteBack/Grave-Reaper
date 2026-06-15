// Game over screen

import { isJustPressed, isConfirm } from '../engine/input.js';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '00')}`;
}

export class GameOverScreen {
  constructor() {
    this.stats = null;
    this.blinkTimer = 0;
    this.blinkOn = true;
    this.showTimer = 0;
    // Hitbox for the "View Rankings" button (logical 480x270 coordinates). Used by main for click detection.
    this.rankingBtnRect = null;
  }

  show(stats) {
    this.stats = stats;
    this.blinkTimer = 0;
    this.blinkOn = true;
    this.showTimer = 0;
  }

  update(dt) {
    this.blinkTimer += dt;
    this.showTimer += dt;
    if (this.blinkTimer >= 0.5) {
      this.blinkTimer = 0;
      this.blinkOn = !this.blinkOn;
    }

    // Prevent accidental skip — require 1 second before input
    if (this.showTimer < 1.0) return null;

    if (isJustPressed('KeyL')) return 'ranking';   // View rankings (can also click)
    if (isJustPressed('KeyR')) return 'retry';
    if (isConfirm()) return 'title';

    return null;
  }

  draw(ctx) {
    const W = 480;
    const H = 270;
    const UI_FONT = "'Yu Gothic', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif";

    ctx.save();
    ctx.textAlign = 'center';

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    // Game Over or Victory
    const win = this.stats && this.stats.victory;
    ctx.fillStyle = win ? '#ffdd44' : '#ff2222';
    ctx.font = `bold 32px ${UI_FONT}`;
    ctx.shadowColor = win ? '#ffaa00' : '#ff0000';
    ctx.shadowBlur = 20;
    ctx.fillText(win ? '★ ALL STAGES CLEARED! ★' : 'GAME OVER', W / 2, 62);
    ctx.shadowBlur = 0;

    // Results
    if (this.stats) {
      const statsY = 96;
      ctx.font = `13px ${UI_FONT}`;
      ctx.fillStyle = '#e0e0e0';
      ctx.fillText(`Time Survived : ${formatTime(this.stats.time)}`, W / 2, statsY);
      ctx.fillText(`Kills         : ${this.stats.kills}`,            W / 2, statsY + 20);
      ctx.fillText(`Max Level     : ${this.stats.level}`,           W / 2, statsY + 40);
      ctx.fillText(`Total Gems    : ${this.stats.gems}`,            W / 2, statsY + 60);

      // Shadows banked into the Shadow Vault this run.
      if (this.stats.shadowsEarned != null) {
        ctx.fillStyle = '#c8a2ff';
        ctx.font = `bold 13px ${UI_FONT}`;
        ctx.fillText(
          `👻 +${this.stats.shadowsEarned} Shadows   (Vault: ${this.stats.shadowsTotal})`,
          W / 2, statsY + 84,
        );
      }
    }

    // ── "View Rankings" button (retro style, clickable) ──
    const bw = 176, bh = 26;
    const bx = W / 2 - bw / 2, by = 202;
    this.rankingBtnRect = { x: bx, y: by, w: bw, h: bh };
    // Framed button (dark background + gold frame to match existing UI)
    ctx.fillStyle = 'rgba(34,18,8,0.92)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = this.blinkOn ? '#ffd24a' : '#aa7722';   // Subtle blink to show it's clickable
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
    ctx.fillStyle = '#ffe07a';
    ctx.font = `bold 13px ${UI_FONT}`;
    ctx.fillText('🏆 View Rankings', W / 2, by + 19);

    // Helper hint below button
    ctx.fillStyle = '#aa9988';
    ctx.font = `9px ${UI_FONT}`;
    ctx.fillText('Click or press [ L ]', W / 2, by + bh + 12);

    // Controls (Retry / Title)
    if (this.blinkOn) {
      ctx.fillStyle = '#ffdd44';
      ctx.font = `bold 12px ${UI_FONT}`;
      ctx.fillText('[ R ] Retry    [ Enter ] Title Screen', W / 2, 250);
    }

    ctx.restore();
  }
}
