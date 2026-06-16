/**
 * Assistente IA — Plano Financeiro Nexus (Puter.js)
 */
(function () {
  const KNOWLEDGE = `
PLANO FINANCEIRO NEXUS — ÁREA FINANCEIRO — CESURG — 1º sem 2025
Faturamento R$ 19,3 mi | Lucro R$ 186 mil | Margem 1,0% | Meta 3% em 12 meses | Ganho +R$ 362 mil/semestre
Receita líquida R$ 18.262.354 | Frete R$ 849.903 (4,7%) | Inadimplência R$ 2,18 mi | DSO 56 dias
Top 3 clientes 41,6% | Elétricos margem ~19% caindo | LogNorte cara, 6,7% devolução
5 frentes: frete, crédito por risco, margem mínima, devoluções, recebimento
Margens mín: Abrasivos 35%, EPI 33%, MRO 30%, Hidráulica 28%, Ferramentas 27%, Elétricos 22%
Impacto: frete +119k, inadimplência +200k, devoluções +147k, elétricos +54k
Apresentação 10-15 min, 8 slides. Abertura: "Faturou 19 mi, lucrou 186 mil."
`.trim();

  const SUGGESTIONS = [
    "Margem líquida atual?",
    "Ganho se frete cair para 4%?",
    "Política de crédito?",
    "O que falar na apresentação?",
  ];

  function init() {
    if (typeof puter === "undefined") return;

    const css = document.createElement("style");
    css.textContent = `
      body.nexus-chat-open { overflow: hidden; }

      #nexus-chat-backdrop {
        position: fixed; inset: 0;
        background: rgba(12, 35, 64, 0.45);
        z-index: 9990;
        opacity: 0; pointer-events: none;
        transition: opacity 0.25s ease;
      }
      #nexus-chat-backdrop.show { opacity: 1; pointer-events: auto; }

      #nexus-chat-toggle {
        position: fixed;
        right: max(20px, env(safe-area-inset-right));
        bottom: max(20px, env(safe-area-inset-bottom));
        width: 58px; height: 58px; border-radius: 50%;
        background: linear-gradient(145deg, #0c2340, #1a4a7a);
        color: #fbbf24; border: none;
        cursor: pointer; z-index: 9992;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 6px 24px rgba(12,35,64,0.4);
        transition: transform 0.2s, opacity 0.2s, visibility 0.2s;
      }
      #nexus-chat-toggle:hover { transform: scale(1.06); }
      #nexus-chat-toggle.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
      #nexus-chat-toggle svg { width: 26px; height: 26px; }

      #nexus-chat-panel {
        position: fixed;
        z-index: 9991;
        display: flex; flex-direction: column;
        background: #f1f5f9;
        font-family: "DM Sans", system-ui, sans-serif;
        overflow: hidden;
        opacity: 0; visibility: hidden; pointer-events: none;
        transform: translateY(16px) scale(0.97);
        transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
        right: max(20px, env(safe-area-inset-right));
        bottom: calc(88px + env(safe-area-inset-bottom));
        width: min(420px, calc(100dvw - 40px));
        height: min(620px, calc(100dvh - 120px));
        max-width: calc(100dvw - 40px);
        border-radius: 20px;
        box-shadow: 0 24px 64px rgba(12,35,64,0.28);
        border: 1px solid rgba(255,255,255,0.2);
      }
      #nexus-chat-panel.open {
        opacity: 1; visibility: visible; pointer-events: auto;
        transform: translateY(0) scale(1);
      }

      #nexus-chat-header {
        flex-shrink: 0;
        padding: 16px 18px;
        padding-top: max(16px, env(safe-area-inset-top));
        background: linear-gradient(135deg, #0c2340 0%, #163a5f 100%);
        color: #fff;
        display: flex; align-items: center; gap: 12px;
        border-bottom: 3px solid #d97706;
      }
      .nexus-chat-avatar {
        width: 40px; height: 40px; border-radius: 12px;
        background: rgba(251,191,36,0.15);
        border: 1px solid rgba(251,191,36,0.35);
        display: flex; align-items: center; justify-content: center;
        font-size: 20px; flex-shrink: 0;
      }
      #nexus-chat-header-text { flex: 1; min-width: 0; }
      #nexus-chat-header-text strong {
        display: block; font-size: 16px; font-weight: 700;
      }
      #nexus-chat-header-text span {
        display: block; font-size: 12px; opacity: 0.8; margin-top: 2px;
      }
      #nexus-chat-close {
        width: 40px; height: 40px; border-radius: 10px;
        background: rgba(255,255,255,0.12); border: none;
        color: #fff; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      #nexus-chat-close:active { background: rgba(255,255,255,0.22); }

      #nexus-chat-messages {
        flex: 1; min-height: 0;
        overflow-y: auto; -webkit-overflow-scrolling: touch;
        padding: 16px;
        display: flex; flex-direction: column; gap: 12px;
      }

      .nexus-chat-row {
        display: flex; gap: 8px; align-items: flex-end;
        max-width: 100%;
      }
      .nexus-chat-row.user { flex-direction: row-reverse; }

      .nexus-chat-bubble {
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 15px; line-height: 1.55;
        white-space: pre-wrap; word-break: break-word;
        max-width: calc(100% - 36px);
      }
      .nexus-chat-row.bot .nexus-chat-bubble {
        background: #fff; color: #1e293b;
        border: 1px solid #e2e8f0;
        border-bottom-left-radius: 6px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      }
      .nexus-chat-row.user .nexus-chat-bubble {
        background: #0c2340; color: #fff;
        border-bottom-right-radius: 6px;
      }
      .nexus-chat-row .mini-avatar {
        width: 28px; height: 28px; border-radius: 8px;
        background: #e2e8f0; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 14px;
      }
      .nexus-chat-row.user .mini-avatar { background: #d97706; }

      #nexus-chat-footer {
        flex-shrink: 0;
        background: #fff;
        border-top: 1px solid #e2e8f0;
        padding-bottom: max(12px, env(safe-area-inset-bottom));
      }
      #nexus-chat-suggestions-label {
        font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.06em; color: #64748b;
        padding: 10px 16px 6px;
      }
      #nexus-chat-suggestions {
        display: flex; gap: 8px;
        padding: 0 16px 10px;
        overflow-x: auto; -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      #nexus-chat-suggestions::-webkit-scrollbar { display: none; }
      .nexus-suggestion {
        flex-shrink: 0;
        font-size: 13px; padding: 8px 14px;
        background: #f8fafc; color: #0c2340;
        border: 1px solid #cbd5e1; border-radius: 20px;
        cursor: pointer; font-family: inherit; font-weight: 500;
        white-space: nowrap;
      }
      .nexus-suggestion:active { background: #e2e8f0; }

      #nexus-chat-form {
        display: flex; gap: 10px; align-items: center;
        padding: 0 16px 4px;
      }
      #nexus-chat-input {
        flex: 1; min-width: 0;
        border: 2px solid #e2e8f0; outline: none;
        padding: 12px 16px; font-size: 16px;
        border-radius: 14px; font-family: inherit;
        color: #0f172a; background: #f8fafc;
      }
      #nexus-chat-input:focus { border-color: #d97706; background: #fff; }
      #nexus-chat-send {
        width: 48px; height: 48px; border: none; flex-shrink: 0;
        background: #d97706; color: #fff;
        border-radius: 14px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      }
      #nexus-chat-send:disabled { opacity: 0.45; cursor: not-allowed; }
      #nexus-chat-send svg { width: 20px; height: 20px; }

      .nexus-chat-typing {
        display: inline-flex; gap: 5px; padding: 4px 0;
      }
      .nexus-chat-typing span {
        width: 7px; height: 7px; border-radius: 50%;
        background: #94a3b8;
        animation: nexusDot 1.2s ease-in-out infinite;
      }
      .nexus-chat-typing span:nth-child(2) { animation-delay: 0.15s; }
      .nexus-chat-typing span:nth-child(3) { animation-delay: 0.3s; }
      @keyframes nexusDot {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
        30% { transform: translateY(-5px); opacity: 1; }
      }

      @media (max-width: 768px) {
        #nexus-chat-panel {
          inset: 0;
          width: 100dvw;
          height: 100dvh;
          max-width: 100dvw;
          max-height: 100dvh;
          border-radius: 0;
          transform: translateY(100%);
        }
        #nexus-chat-panel.open { transform: translateY(0); }
        #nexus-chat-toggle { width: 56px; height: 56px; }
        .nexus-chat-bubble { font-size: 17px; line-height: 1.6; }
        #nexus-chat-header-text strong { font-size: 18px; }
        #nexus-chat-header-text span { font-size: 14px; }
        .nexus-suggestion { font-size: 14px; padding: 10px 16px; }
        #nexus-chat-input { font-size: 17px; }
      }
    `;
    document.head.appendChild(css);

    const backdrop = document.createElement("div");
    backdrop.id = "nexus-chat-backdrop";
    document.body.appendChild(backdrop);

    const toggle = document.createElement("button");
    toggle.id = "nexus-chat-toggle";
    toggle.setAttribute("aria-label", "Abrir chat");
    toggle.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
    document.body.appendChild(toggle);

    const panel = document.createElement("div");
    panel.id = "nexus-chat-panel";
    panel.innerHTML = `
      <header id="nexus-chat-header">
        <div class="nexus-chat-avatar" aria-hidden="true">💼</div>
        <div id="nexus-chat-header-text">
          <strong>Assistente Nexus</strong>
          <span>Tire dúvidas sobre o plano financeiro</span>
        </div>
        <button id="nexus-chat-close" type="button" aria-label="Fechar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </header>
      <div id="nexus-chat-messages"></div>
      <div id="nexus-chat-footer">
        <div id="nexus-chat-suggestions-label">Perguntas rápidas</div>
        <div id="nexus-chat-suggestions"></div>
        <form id="nexus-chat-form">
          <input id="nexus-chat-input" type="text" placeholder="Digite sua pergunta..." autocomplete="off" enterkeyhint="send" />
          <button id="nexus-chat-send" type="submit" aria-label="Enviar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(panel);

    const messagesEl = panel.querySelector("#nexus-chat-messages");
    const suggestionsEl = panel.querySelector("#nexus-chat-suggestions");
    const form = panel.querySelector("#nexus-chat-form");
    const input = panel.querySelector("#nexus-chat-input");
    const sendBtn = panel.querySelector("#nexus-chat-send");

    const conversation = [{
      role: "system",
      content: `Assistente do Plano Financeiro Nexus (CESURG). Responda em português, curto (máx 6 linhas), com números quando couber. Não invente dados.

${KNOWLEDGE}`,
    }];

    function addMessage(role, text) {
      const row = document.createElement("div");
      row.className = "nexus-chat-row " + role;
      const av = document.createElement("div");
      av.className = "mini-avatar";
      av.textContent = role === "bot" ? "🤖" : "👤";
      const bubble = document.createElement("div");
      bubble.className = "nexus-chat-bubble";
      bubble.textContent = text;
      row.appendChild(av);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return bubble;
    }

    addMessage("bot", "Oi! Pergunte sobre margem, frete, crédito ou apresentação.\n\nNa 1ª mensagem pode abrir um login rápido do Puter (grátis) — é normal.");

    SUGGESTIONS.forEach((text) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nexus-suggestion";
      btn.textContent = text;
      btn.addEventListener("click", () => {
        input.value = text;
        form.requestSubmit();
      });
      suggestionsEl.appendChild(btn);
    });

    function setOpen(open) {
      panel.classList.toggle("open", open);
      backdrop.classList.toggle("show", open);
      toggle.classList.toggle("hidden", open);
      document.body.classList.toggle("nexus-chat-open", open);
      if (open) setTimeout(() => input.focus(), 300);
    }

    toggle.addEventListener("click", () => setOpen(true));
    panel.querySelector("#nexus-chat-close").addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));

    let busy = false;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const question = input.value.trim();
      if (!question || busy) return;

      input.value = "";
      busy = true;
      sendBtn.disabled = true;

      addMessage("user", question);
      conversation.push({ role: "user", content: question });

      const botEl = addMessage("bot", "");
      botEl.innerHTML = `<span class="nexus-chat-typing"><span></span><span></span><span></span></span>`;

      try {
        const response = await puter.ai.chat(conversation, false, {
          model: "gpt-5-nano",
          stream: true,
        });

        let answer = "";
        for await (const part of response) {
          if (part?.text) {
            answer += part.text;
            botEl.textContent = answer;
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
        }

        if (!answer) {
          botEl.textContent = "Não consegui responder. Tente de novo.";
          conversation.pop();
        } else {
          conversation.push({ role: "assistant", content: answer });
        }
      } catch (err) {
        botEl.textContent = "Não foi possível responder. Se apareceu um popup, faça login no Puter e tente novamente.";
        conversation.pop();
      } finally {
        busy = false;
        sendBtn.disabled = false;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
