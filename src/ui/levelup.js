// Level up: Skill card selection UI (drawn on high-res overlay)

import { isNavLeft, isNavRight, isConfirm, isJustPressed } from '../engine/input.js';

const UI_FONT = "'Yu Gothic', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif";

// Color scheme by category
const CAT_STYLE = {
  'Weapon':  { accent: '#46f0a8' },
  'AoE':     { accent: '#ff6bd6' },
  'Upgrade': { accent: '#ffb347' },
  'Stat':    { accent: '#9db4ff' },
};

export class LevelUpUI {
  constructor() {
    this.choices = [];
    this.selectedIndex = 0;
    this.visible = false;
    this.onSelect = null;
    this.cardRects = [];   // logical 480×270 hit-boxes, set during draw (for touch/click)
  }

  // Tap/click selection: pick the card under the pointer and confirm it.
  // Returns true if a card was hit. Coords are in logical 480×270 space.
  handleTap(lx, ly) {
    if (!this.visible) return false;
    for (let i = 0; i < this.cardRects.length; i++) {
      const r = this.cardRects[i];
      if (lx >= r.x && lx <= r.x + r.w && ly >= r.y && ly <= r.y + r.h) {
        this.selectedIndex = i;
        this.confirmSelection();
        return true;
      }
    }
    return false;
  }

  show(choices, onSelect) {
    this.choices = choices;
    this.selectedIndex = 0;
    this.visible = true;
    this.onSelect = onSelect;
  }

  hide() {
    this.visible = false;
    this.choices = [];
  }

  update() {
    if (!this.visible) return;

    if (isNavLeft())  this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    if (isNavRight()) this.selectedIndex = Math.min(this.choices.length - 1, this.selectedIndex + 1);

    for (let i = 1; i <= 3; i++) {
      if (isJustPressed(`Digit${i}`) || isJustPressed(`Numpad${i}`)) {
        if (i - 1 < this.choices.length) {
          this.selectedIndex = i - 1;
          this.confirmSelection();
          return;
        }
      }
    }

    if (isConfirm()) this.confirmSelection();
  }

  confirmSelection() {
    if (this.onSelect) this.onSelect(this.selectedIndex);
    this.hide();
  }

  draw(ctx) {
    if (!this.visible || this.choices.length === 0) return;

    const W = 480, H = 270;
    ctx.save();
    ctx.textAlign = 'center';

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillRect(0, 0, W, H);

    // Header
    ctx.fillStyle = '#ffdd44';
    ctx.font = `bold 20px ${UI_FONT}`;
    ctx.shadowColor = '#aa6600';
    ctx.shadowBlur = 8;
    ctx.fillText('LEVEL UP!', W / 2, 34);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = `12px ${UI_FONT}`;
    ctx.fillText('Choose one upgrade', W / 2, 50);

    // Cards
    const n = this.choices.length;
    const cardW = 132, cardH = 150, gap = 14;
    const totalW = n * cardW + (n - 1) * gap;
    const startX = (W - totalW) / 2;
    const cardY = 62;
    this.cardRects = [];

    for (let i = 0; i < n; i++) {
      const c = this.choices[i];
      const cx = startX + i * (cardW + gap);
      const sel = i === this.selectedIndex;
      this.cardRects.push({ x: cx, y: cardY, w: cardW, h: cardH });
      const catLabel = c.cat || '';
      const style = CAT_STYLE[catLabel] || { accent: '#cccccc' };

      // Card background
      const g = ctx.createLinearGradient(cx, cardY, cx, cardY + cardH);
      if (sel) { g.addColorStop(0, '#2a1c05'); g.addColorStop(1, '#140d02'); }
      else     { g.addColorStop(0, '#12121f'); g.addColorStop(1, '#080810'); }
      ctx.fillStyle = g;
      ctx.fillRect(cx, cardY, cardW, cardH);

      // Frame (glow + thick line when selected)
      if (sel) { ctx.shadowColor = style.accent; ctx.shadowBlur = 14; }
      ctx.strokeStyle = sel ? style.accent : '#3a4a5a';
      ctx.lineWidth = sel ? 3 : 1.5;
      ctx.strokeRect(cx + 1, cardY + 1, cardW - 2, cardH - 2);
      ctx.shadowBlur = 0;

      // Category badge
      ctx.fillStyle = style.accent;
      ctx.font = `bold 10px ${UI_FONT}`;
      ctx.fillText(catLabel, cx + cardW / 2, cardY + 18);

      // Number
      ctx.fillStyle = sel ? '#ffdd44' : '#667788';
      ctx.font = `bold 11px ${UI_FONT}`;
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, cx + 8, cardY + 18);
      ctx.textAlign = 'center';

      // Icon (Emoji)
      ctx.font = '40px serif';
      ctx.fillText(c.iconEmoji || '?', cx + cardW / 2, cardY + 66);

      // Skill name
      ctx.fillStyle = sel ? style.accent : '#ffffff';
      ctx.font = `bold 15px ${UI_FONT}`;
      ctx.fillText(c.name, cx + cardW / 2, cardY + 92);

      // Description (with wrapping)
      ctx.fillStyle = '#cdd6e0';
      ctx.font = `12px ${UI_FONT}`;
      const lines = wrapTextChar(c.desc, cardW - 16, ctx);
      lines.forEach((ln, li) => {
        ctx.fillText(ln, cx + cardW / 2, cardY + 112 + li * 16);
      });

      // Selection marker
      if (sel) {
        ctx.fillStyle = '#ffdd44';
        ctx.font = `bold 11px ${UI_FONT}`;
        ctx.fillText('▼ SELECTED ▼', cx + cardW / 2, cardY + cardH - 8);
      }
    }

    // Control guide
    ctx.fillStyle = '#8899aa';
    ctx.font = `11px ${UI_FONT}`;
    ctx.fillText('Tap a card  •  [ ← → ] Move   [ 1 / 2 / 3 ] Quick Select   [ Enter / Space ] Confirm', W / 2, H - 12);

    ctx.restore();
  }
}

// Character-by-character text wrapping (useful for tight spaces)
function wrapTextChar(text, maxWidth, ctx) {
  const lines = [];
  let cur = '';
  for (const ch of text) {
    const test = cur + ch;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = ch;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
