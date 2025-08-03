// js/agent.js —— 不要有 import
(function (w) {
  class BackgroundAgent {
    constructor({ db, getSettings, ui }) {
      this.db = db; this.getSettings = getSettings; this.ui = ui || {};
      this.timer = null; this.lock = false; this.abort = new AbortController();
      this.lastActAt = 0; this.gateAt = 0;
    }
    start(){ if (this.timer) return; this.timer = setInterval(()=>this.tick(), 1000); this.ui.setAgentStatus?.('running'); }
    stop(){ if (this.timer) clearInterval(this.timer); this.timer=null; this.abort.abort(); this.abort=new AbortController(); this.ui.setAgentStatus?.('stopped'); }

    async tick(){
      if (document.hidden || this.lock) return;
      const s = await this.getSettings();
      if (!s?.bgEnabled || !s?.apiKey || !s?.model) return;
      const intervalSec = Number(s.intervalSec ?? 60);
      if (Date.now() - this.gateAt < intervalSec*1000) return;

      const cooldownSec = s.cooldownMinutes!=null ? Number(s.cooldownMinutes)*60 : Number(s.cooldownHours||0)*3600;
      if (cooldownSec>0 && (Date.now()-this.lastActAt) < cooldownSec*1000) { this.gateAt = Date.now(); return; }

      this.lock = true;
      try{
        const context = await this.buildContext();
        const plan = await w.LLM.planPushJSON({ settings:s, context, signal:this.abort.signal });
        if (plan?.action==='post' && plan.text?.trim()){
          const text = plan.text.trim();
          await this._writeIncoming(text);
          this.ui.renderIncoming?.(text);
          this.lastActAt = Date.now();
          this.ui.setAgentStatus?.('running');
        } else {
          await this._log({ level:'info', msg:'plan:none' });
        }
      }catch(e){
        await this._log({ level:'error', msg:String(e) });
        this.ui.setAgentStatus?.('error');
      }finally{
        this.gateAt = Date.now();
        this.lock = false;
      }
    }

    async buildContext(){
      try{
        const msgs = await this.db?.messages?.orderBy('ts').reverse().limit(12).toArray() ?? [];
        return { recent: msgs.map(m => ({ dir:m.direction, text:m.text, ts:m.ts })) };
      }catch{ return { recent: [] }; }
    }
    async _writeIncoming(text){
      const row = { id: crypto.randomUUID(), ts: Date.now(), from:'M', to:'Anni', direction:'in', text };
      if (this.db?.messages) await this.db.messages.add(row);
    }
    async _log(entry){ try{ await this.db?.agent_logs?.add({ ts:Date.now(), ...entry }); }catch{} }
  }
  w.BackgroundAgent = BackgroundAgent;
})(window);
