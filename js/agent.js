import { planPushJSON } from './llm_vendor.js';

export class BackgroundAgent {
  constructor({ db, getSettings, ui }) {
    this.db = db;
    this.getSettings = getSettings;
    this.ui = ui;
    this.timer = null;
    this.lock = false;
    this.abort = new AbortController();
    this.lastActAt = 0;
    this._gate = 0;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), 1000); // 每秒判斷一次
    if (this.ui?.setAgentStatus) {
      this.ui.setAgentStatus('running');
    }
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.abort.abort();
    this.abort = new AbortController();
    if (this.ui?.setAgentStatus) {
      this.ui.setAgentStatus('stopped');
    }
  }

  async tick() {
    if (document.hidden || this.lock) return;
    const s = await this.getSettings();
    if (!s || !s.bgEnabled || !s.apiKey || !s.model) return;

    // 計算冷靜期秒數
    const cooldownSec = s.cooldownMinutes ? s.cooldownMinutes * 60 : (s.cooldownHours || 0) * 3600;
    if (cooldownSec > 0 && Date.now() - this.lastActAt < cooldownSec * 1000) {
      return;
    }

    // 每 intervalSec 秒才真正跑一次
    const intervalSec = s.intervalSec ?? 60;
    if (!this._gate) this._gate = Date.now();
    if (Date.now() - this._gate < intervalSec * 1000) {
      return;
    }
    this._gate = Date.now();

    this.lock = true;
    try {
      const context = await this.buildContext();
      const plan = await planPushJSON({ settings: s, context, signal: this.abort.signal });
      if (plan?.action === 'post' && plan.text?.trim()) {
        const msg = plan.text.trim();
        await this.db.messages.add({
          id: crypto.randomUUID(),
          ts: Date.now(),
          from: 'M',
          to: 'Anni',
          direction: 'in',
          text: msg
        });
        if (this.ui?.renderIncoming) {
          this.ui.renderIncoming(msg);
        }
        this.lastActAt = Date.now();
        if (this.ui?.setAgentStatus) {
          this.ui.setAgentStatus('running');
        }
      }
    } catch (e) {
      await this.db.agent_logs.add({ ts: Date.now(), level: 'error', msg: String(e) });
      if (this.ui?.setAgentStatus) {
        this.ui.setAgentStatus('error');
      }
    } finally {
      this.lock = false;
    }
  }

  async buildContext() {
    // 從 Dexie 拿最近 N 則對話/動態，轉成短摘要給模型
    // 這裡維持你現有的取數函式，避免重寫。
    return {};
  }
}
