// タイトル画面：キャラクター選択 → 難易度選択 → ゲーム開始

import { isConfirm, isNavLeft, isNavRight, isJustPressed } from '../engine/input.js';
import { drawSprite } from '../engine/sprites.js';
import { DIFFICULTIES } from '../data/difficulty.js';

const JP_FONT = "'Yu Gothic', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif";

const CHARACTERS = [
  {
    id: 'knight',
    name: 'Dark Knight',
    idleFrame: 'player_knight_idle',
    desc: ['HP: 120', 'Starting weapon: Sword', 'Tanky / Melee'],
    accentColor: '#5b9bff',
  },
  {
    id: 'mage',
    name: 'Dark Mage',
    idleFrame: 'player_mage_idle',
    desc: ['HP: 80', 'Starting weapon: Fireball', 'Fragile / Ranged Magic'],
    accentColor: '#cc66ff',
  },
];

export class TitleScreen {
  constructor() {
    this.blinkTimer = 0;
    this.blinkOn = true;
    this.bgX = 0;
    this.selectedChar = 0;
    this.selectedDiff = 0;
    this.phase = 'title';    // 'title' | 'char' | 'difficulty'
    this.charBobTimer = 0;
  }

  update(dt) {
    this.blinkTimer += dt;
    if (this.blinkTimer >= 0.55) { this.blinkTimer = 0; this.blinkOn = !this.blinkOn; }
    this.bgX += dt * 8;
    this.charBobTimer += dt * 2.5;

    if (this.phase === 'title') {
      if (isConfirm()) { this.phase = 'char'; return null; }
    } else if (this.phase === 'char') {
      if (isNavLeft())  this.selectedChar = 0;
      if (isNavRight()) this.selectedChar = 1;
      if (isJustPressed('Digit1') || isJustPressed('Numpad1')) this.selectedChar = 0;
      if (isJustPressed('Digit2') || isJustPressed('Numpad2')) this.selectedChar = 1;
      if (isJustPressed('Escape') || isJustPressed('Backspace')) this.phase = 'title';
      if (isConfirm()) { this.phase = 'difficulty'; return null; }
    } else if (this.phase === 'difficulty') {
      if (isNavLeft())  this.selectedDiff = Math.max(0, this.selectedDiff - 1);
      if (isNavRight()) this.selectedDiff = Math.min(DIFFICULTIES.length - 1, this.selectedDiff + 1);
      for (let i = 1; i <= 4; i++) {
        if (isJustPressed(`Digit${i}`) || isJustPressed(`Numpad${i}`)) this.selectedDiff = i - 1;
      }
      if (isJustPressed('Escape') || isJustPressed('Backspace')) this.phase = 'char';
      if (isConfirm()) {
        return {
          action: 'start',
          character: CHARACTERS[this.selectedChar],
          difficulty: DIFFICULTIES[this.selectedDiff],
        };
      }
    }
    return null;
  }

  draw(ctx) {
    const W = 480, H = 270;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (this.phase === 'title')           this._drawTitle(ctx, W, H);
    else if (this.phase === 'char')       this._drawCharSelect(ctx, W, H);
    else                                  this._drawDiffSelect(ctx, W, H);
    ctx.restore();
  }

  _drawTitle(ctx, W, H) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(50, 50, W - 100, 120);
    ctx.strokeStyle = '#884422';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, W - 100, 120);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 30px ${JP_FONT}`;
    ctx.shadowColor = '#ff4422';
    ctx.shadowBlur = 16;
    ctx.fillText('☠ GRAVE REAPER ☠', W / 2, 96);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#cc8844';
    ctx.font = `9px ${JP_FONT}`;
    ctx.fillText('GOTHIC SURVIVAL ACTION', W / 2, 116);

    if (this.blinkOn) {
      ctx.fillStyle = '#ffdd44';
      ctx.font = `bold 12px ${JP_FONT}`;
      ctx.fillText('PRESS ENTER / SPACE', W / 2, 150);
    }

    ctx.fillStyle = '#8899aa';
    ctx.font = `9px ${JP_FONT}`;
    ctx.fillText('Move: A/D / ← →   Jump: Space/Enter   Attack: Auto', W / 2, 200);
    ctx.fillStyle = '#667788';
    ctx.fillText('Collect gems to level up. Survive 7 min to face the Large Demon!', W / 2, 214);
    ctx.fillStyle = '#7a6a88';
    ctx.fillText('Press F / the ⛶ button (top-right) for fullscreen', W / 2, 227);

    // ビルド確認用バージョン（キャッシュ判別用）
    ctx.fillStyle = '#55cc77';
    ctx.font = `bold 9px ${JP_FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText('build v22', W - 6, H - 6);
  }

  _drawCharSelect(ctx, W, H) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, 30);
    ctx.fillStyle = '#ffdd44';
    ctx.font = `bold 13px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('SELECT CHARACTER', W / 2, 20);

    const cardW = 150, cardH = 168, gap = 24;
    const totalW = CHARACTERS.length * cardW + (CHARACTERS.length - 1) * gap;
    const startX = (W - totalW) / 2, cardY = 40;

    for (let i = 0; i < CHARACTERS.length; i++) {
      const ch = CHARACTERS[i];
      const cx = startX + i * (cardW + gap);
      const sel = i === this.selectedChar;

      ctx.fillStyle = sel ? 'rgba(20,12,4,0.9)' : 'rgba(6,6,16,0.8)';
      ctx.fillRect(cx, cardY, cardW, cardH);
      if (sel) { ctx.shadowColor = ch.accentColor; ctx.shadowBlur = 12; }
      ctx.strokeStyle = sel ? ch.accentColor : '#334455';
      ctx.lineWidth = sel ? 3 : 1.5;
      ctx.strokeRect(cx + 1, cardY + 1, cardW - 2, cardH - 2);
      ctx.shadowBlur = 0;

      ctx.fillStyle = sel ? '#ffdd44' : '#556677';
      ctx.font = `bold 11px ${JP_FONT}`;
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, cx + 8, cardY + 16);

      const sprW = 56, sprH = 74;
      const bob = Math.sin(this.charBobTimer + i * 1.5) * 2;
      drawSprite(ctx, ch.idleFrame, cx + (cardW - sprW) / 2, cardY + 18 + bob, sprW, sprH);

      ctx.textAlign = 'center';
      ctx.fillStyle = sel ? ch.accentColor : '#ccced8';
      ctx.font = `bold 14px ${JP_FONT}`;
      ctx.fillText(ch.name, cx + cardW / 2, cardY + 108);

      ctx.font = `11px ${JP_FONT}`;
      ch.desc.forEach((ln, li) => {
        ctx.fillStyle = sel ? '#dddddd' : '#778899';
        ctx.fillText(ln, cx + cardW / 2, cardY + 124 + li * 13);
      });
    }

    ctx.fillStyle = '#8899aa';
    ctx.font = `10px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('[ ← → / 1·2 ] Select   [ Enter ] Confirm   [ Esc ] Back', W / 2, H - 10);
  }

  _drawDiffSelect(ctx, W, H) {
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffdd44';
    ctx.font = `bold 15px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('SELECT DIFFICULTY', W / 2, 30);

    const n = DIFFICULTIES.length;
    const cardW = 104, cardH = 150, gap = 8;
    const totalW = n * cardW + (n - 1) * gap;
    const startX = (W - totalW) / 2, cardY = 48;

    for (let i = 0; i < n; i++) {
      const d = DIFFICULTIES[i];
      const cx = startX + i * (cardW + gap);
      const sel = i === this.selectedDiff;

      ctx.fillStyle = sel ? 'rgba(24,16,6,0.95)' : 'rgba(8,8,16,0.85)';
      ctx.fillRect(cx, cardY, cardW, cardH);
      if (sel) { ctx.shadowColor = d.color; ctx.shadowBlur = 14; }
      ctx.strokeStyle = sel ? d.color : '#334455';
      ctx.lineWidth = sel ? 3 : 1.5;
      ctx.strokeRect(cx + 1, cardY + 1, cardW - 2, cardH - 2);
      ctx.shadowBlur = 0;

      ctx.fillStyle = sel ? '#ffdd44' : '#556677';
      ctx.font = `bold 10px ${JP_FONT}`;
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, cx + 7, cardY + 15);

      ctx.textAlign = 'center';
      ctx.fillStyle = d.color;
      ctx.font = `bold 16px ${JP_FONT}`;
      ctx.fillText(d.name, cx + cardW / 2, cardY + 40);

      ctx.font = `10px ${JP_FONT}`;
      d.desc.forEach((ln, li) => {
        ctx.fillStyle = sel ? '#dddddd' : '#8090a0';
        ctx.fillText(ln, cx + cardW / 2, cardY + 64 + li * 16);
      });

      if (sel) {
        ctx.fillStyle = '#ffdd44';
        ctx.font = `bold 10px ${JP_FONT}`;
        ctx.fillText('▼ SELECTED ▼', cx + cardW / 2, cardY + cardH - 10);
      }
    }

    ctx.fillStyle = '#8899aa';
    ctx.font = `10px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('[ ← → / 1-4 ] Select   [ Enter ] Start Game   [ Esc ] Back', W / 2, H - 12);
  }
}
