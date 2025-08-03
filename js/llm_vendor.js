/**
 * LLM vendor adapter to call OpenAI-compatible or Google Generative Language endpoints.
 * Returns a JSON with action and text based on context.
 */
export async function planPushJSON({ settings: s, context, signal }) {
  const sysPrompt = "你是 Michael（M）。只輸出 JSON：{\"action\":\"post\"|\"none\",\"text\"?:string}。";
  const parseJSON = (txt) => {
    try {
      return JSON.parse(txt);
    } catch {
      return { action: 'none' };
    }
  };

  if (/generativelanguage\.googleapis\.com/.test(s.proxyUrl || '')) {
    const urlBase = s.proxyUrl.replace(/\/$/, '');
    const url = `${urlBase}/models/${encodeURIComponent(s.model)}:generateContent?key=${encodeURIComponent(s.apiKey)}`;
    const body = {
      contents: [
        { role: "user", parts: [{ text: `${sysPrompt}\n\nCONTEXT:\n${JSON.stringify(context)}` }] }
      ],
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
    };
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal
      });
      if (!resp.ok) throw new Error(`LLM ${resp.status}`);
      const data = await resp.json();
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      return parseJSON(txt);
    } catch (err) {
      // second attempt with stronger instruction
      try {
        const body2 = JSON.parse(JSON.stringify(body));
        body2.contents[0].parts[0].text = `${sysPrompt} 僅輸出JSON。\n\nCONTEXT:\n${JSON.stringify(context)}`;
        const resp2 = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body2),
          signal
        });
        if (!resp2.ok) throw new Error(`LLM ${resp2.status}`);
        const data2 = await resp2.json();
        const txt2 = data2.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
        return parseJSON(txt2);
      } catch {
        console.error(err);
        return { action: 'none' };
      }
    }
  } else {
    const urlBase = s.proxyUrl.replace(/\/$/, '');
    const url = `${urlBase}/v1/chat/completions`;
    const body = {
      model: s.model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: JSON.stringify(context) }
      ]
    };
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${s.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal
      });
      if (!resp.ok) throw new Error(`LLM ${resp.status}`);
      const data = await resp.json();
      const txt = data.choices?.[0]?.message?.content ?? "{}";
      return parseJSON(txt);
    } catch (err) {
      try {
        const body2 = JSON.parse(JSON.stringify(body));
        body2.messages[0].content = `${sysPrompt} 僅輸出JSON。`;
        const resp2 = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${s.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body2),
          signal
        });
        if (!resp2.ok) throw new Error(`LLM ${resp2.status}`);
        const data2 = await resp2.json();
        const txt2 = data2.choices?.[0]?.message?.content ?? "{}";
        return parseJSON(txt2);
      } catch {
        console.error(err);
        return { action: 'none' };
      }
    }
  }
}
