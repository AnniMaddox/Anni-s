// js/llm_vendor.js  —— 不要有 export
(function (w) {
  async function planPushJSON({ settings: s, context, signal }) {
    const sys = '你是 Michael（M）。只輸出 JSON：{"action":"post"|"none","text"?:string}。不要多餘文字。';
    const parseOrNone = (txt) => { try { return JSON.parse(txt) } catch { return { action: 'none' } } };
    const useGoogle = /generativelanguage\.googleapis\.com/.test(s.proxyUrl || '');

    if (useGoogle) {
      const base = s.proxyUrl.replace(/\/$/, '');
      const url = `${base}/models/${encodeURIComponent(s.model)}:generateContent?key=${encodeURIComponent(s.apiKey)}`;
      const body = {
        contents: [{ role: "user", parts: [{ text: `${sys}\n\nCONTEXT:\n${JSON.stringify(context)}` }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
      };
      const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body), signal });
      if (!r.ok) throw new Error(`LLM ${r.status}`);
      const data = await r.json();
      const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      return parseOrNone(txt);
    } else {
      const url = `${s.proxyUrl.replace(/\/$/, '')}/v1/chat/completions`;
      const body = {
        model: s.model, temperature: 0.7, response_format: { type: "json_object" },
        messages: [{ role:"system", content: sys }, { role:"user", content: JSON.stringify(context) }]
      };
      const r = await fetch(url, { method:'POST',
        headers:{ 'Authorization':`Bearer ${s.apiKey}`, 'Content-Type':'application/json' },
        body: JSON.stringify(body), signal
      });
      if (!r.ok) throw new Error(`LLM ${r.status}`);
      const data = await r.json();
      const txt = data?.choices?.[0]?.message?.content ?? "{}";
      return parseOrNone(txt);
    }
  }
  w.LLM = { planPushJSON };
})(window);
