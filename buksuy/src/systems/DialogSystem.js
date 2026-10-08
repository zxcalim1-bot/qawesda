import { DIALOGS } from '../data/dialogs.js';
import { NPCS } from '../data/npcs.js';
import { DialogPanel } from '../ui/DialogPanel.js';
import { ShopPanel } from '../ui/ShopPanel.js';
import { WorkshopPanel } from '../ui/WorkshopPanel.js';
import { UpgradePanel } from '../ui/UpgradePanel.js';

// Проигрывает деревья диалогов из data/dialogs.js
export class DialogSystem {
  constructor(game) {
    this.game = game;
    this.panel = null;
    this.after = null;
  }

  get active() {
    return !!this.panel;
  }

  start(dialogId, npcId = null) {
    const g = this.game;
    const d = DIALOGS[dialogId];
    if (!d || this.panel) return;
    this.dialog = d;
    this.npcId = npcId;
    this.after = null;
    this.panel = new DialogPanel(g, this);
    this.panel.open();
    const start = typeof d.start === 'function' ? d.start(g) : d.start;
    this.go(start);
    g.events.emit('dialog', { id: dialogId, npc: npcId });
  }

  go(key) {
    const g = this.game;
    const node = this.dialog.nodes[key];
    if (!node) {
      this.close();
      return;
    }
    this.node = node;
    if (node.do) node.do(g);
    if (node.after) this.after = node.after;
    const who = node.who === 'me' ? 'me' : node.who || this.npcId;
    const text = typeof node.text === 'function' ? node.text(g) : node.text;
    const options = (node.options || []).filter((o) => !o.if || o.if(g));
    if (who && who !== 'me') g.npcs.get(who)?.say();
    this.panel.show({
      who,
      name: who === 'me' ? 'Ты' : NPCS[who]?.name || '',
      title: who === 'me' ? '' : NPCS[who]?.title || '',
      text,
      options: options.length ? options : null,
      end: node.end || (!options.length && !node.next),
    });
  }

  choose(opt) {
    const g = this.game;
    if (opt.do) opt.do(g);
    if (opt.after) this.after = opt.after;
    if (opt.end) {
      this.close();
      return;
    }
    if (opt.next) this.go(opt.next);
    else this.close();
  }

  advance() {
    const n = this.node;
    if (!n) return this.close();
    if (n.options && n.options.some((o) => !o.if || o.if(this.game))) return;
    if (n.end || !n.next) return this.close();
    this.go(n.next);
  }

  close() {
    const p = this.panel;
    this.panel = null;
    this.node = null;
    p?.close();
    const after = this.after;
    this.after = null;
    if (after) this._openAfter(after);
  }

  _openAfter(spec) {
    const g = this.game;
    const [kind, id, mul] = spec.split(':');
    setTimeout(() => {
      if (kind === 'shop') new ShopPanel(g, id).open();
      else if (kind === 'workshop') new WorkshopPanel(g, id, Number(mul) || 1).open();
      else if (kind === 'upgrades') new UpgradePanel(g, id).open();
    }, 30);
  }
}
