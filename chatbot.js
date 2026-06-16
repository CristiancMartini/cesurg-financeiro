/**
 * Assistente IA do Plano Financeiro Nexus — powered by Puter.js
 * https://developer.puter.com/tutorials/add-ai-chatbot-to-your-website/
 */
(function () {
  const KNOWLEDGE = `
PLANO FINANCEIRO NEXUS SOLUÇÕES INDUSTRIAIS — ÁREA FINANCEIRO — AIHub CESURG
Período base: 1º semestre 2025. Horizonte do plano: 12 meses.

RESUMO: Nexus faturou R$ 19,3 milhões no semestre mas lucrou apenas R$ 186 mil (margem líquida 1,0%).
Tese: crescimento financeiro, não só comercial. Meta: margem 1% → 3% em 12 meses.
Ganho estimado: +R$ 362 mil/semestre (~R$ 730 mil/ano).

INDICADORES: Receita bruta R$ 19.309.749 | Devoluções R$ 1.047.395 (5,4%) | Receita líquida R$ 18.262.354
CMV R$ 12.588.373 | Lucro bruto R$ 5.673.980 (31,1%) | Despesas operacionais R$ 5.487.954 (30,1%)
Resultado líquido R$ 186.026 | Frete R$ 849.903 (4,7%) | Inadimplência R$ 2.182.214
DSO 56 dias (subiu de 52 para 61) | DPO 34 dias | Ciclo financeiro 22 dias.

EVOLUÇÃO MENSAL: Jan 2,5% | Fev 6,3% | Mar -0,7% | Abr -0,1% | Mai -3,8% | Jun 1,2%
Frete jan R$ 118.519 → jun R$ 171.648.

PROBLEMAS: Margem crítica | Frete em alta | LogNorte ~R$ 382 mil frete, 6,7% devolução, 12 atrasos
Top 3 clientes (Metalúrgica Serrana, MoveBem, AgroForte) = 41,6% faturamento
Elétricos ~R$ 2,68 mi receita, margem ~19,1%, caiu de 26% para 16%
Capital de giro pressionado.

5 FRENTES DO PLANO:
A) Frete/logística — meta frete 4,7% → 4,0%, economia R$ 119.409/semestre
B) Crédito por risco — inadimplência → R$ 1,50 mi, DSO → 45 dias
C) Margem mínima por categoria — Abrasivos 35%, EPI 33%, MRO 30%, Hidráulica 28%, Ferramentas 27%, Elétricos 22%
D) Devoluções — 5,4% → 3,5%
E) Caixa — desconto 1,5% pagamento 7 dias, liberar ~R$ 1,1 mi capital de giro

CLASSIFICAÇÃO RISCO CLIENTES:
Baixo: inad ≤2%, NPS≥7, ≥2 pedidos, compra 90 dias → prazo 45 dias
Médio: inad 2-8%, NPS 5-6 → sem aumento prazo, desconto >3% aprovação
Alto: inad >8%, NPS<5 → entrada 30% ou prazo máx 15 dias, bloquear crédito
Atraso >30 dias perde prazo estendido. Prazo >45 dias precisa aprovação diretor financeiro.

IMPACTO FINANCEIRO (semestre): Frete +R$ 119.409 | Inadimplência +R$ 200.000 | Devoluções +R$ 147.000
Margem Elétricos +R$ 54.000 | Total margem líquida +R$ 362.000
Prioridade: 1º Frete, 2º Crédito, 3º Elétricos, 4º Devoluções

CUSTOS IMPLANTAÇÃO: ~108 horas, ~R$ 2.000, payback 1º mês
Transportadoras: RodoSerra (Serra Gaúcha barata), TransRapido (SC urgente), Encomenda (e-commerce), LogNorte renegociada (Norte RS)

APRESENTAÇÃO: 10-15 min, 8 slides. Frase abertura: "Faturou R$ 19 mi, lucrou R$ 186 mil."
Frase fechamento: "Crescimento financeiro, não só comercial."

PERGUNTAS BANCA:
Margem 1%→3% = +R$ 362 mil/semestre | Frete 4,7%→4,0% = R$ 119.409 economia
DSO 56→45 libera ~R$ 1,1 mi | Implantação ~R$ 2 mil + 108h
`.trim();

  const SUGGESTIONS = [
    "Qual é a margem líquida atual?",
    "Quanto ganhamos se frete cair para 4%?",
    "Como funciona a política de crédito?",
    "O que falar na apresentação?",
  ];

  function init() {
    if (typeof puter === "undefined") {
      console.warn("Puter.js não carregou — assistente IA indisponível.");
      return;
    }

    const style = document.createElement("style");
    style.textContent = `
      #nexus-chat-toggle {
        position: fixed; right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom));
        width: 56px; height: 56px; border-radius: 50%;
        background: linear-gradient(135deg, #0c2340, #163a5f);
        color: #fbbf24; border: 2px solid rgba(251,191,36,0.35);
        cursor: pointer; z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 8px 28px rgba(12,35,64,0.35);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      #nexus-chat-toggle:hover { transform: translateY(-2px) scale(1.03); }
      #nexus-chat-toggle.open { background: #163a5f; }
      #nexus-chat-toggle svg { width: 24px; height: 24px; }
      #nexus-chat-panel {
        position: fixed; right: max(16px, env(safe-area-inset-right)); bottom: calc(80px + env(safe-area-inset-bottom));
        width: min(400px, calc(100vw - 32px)); height: min(560px, calc(100vh - 120px));
        background: #fff; color: #0f172a;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(15,23,42,0.2);
        display: none; flex-direction: column; overflow: hidden;
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: 14px; line-height: 1.55;
        z-index: 9998;
        border: 1px solid #e2e8f0;
      }
      #nexus-chat-panel.open { display: flex; animation: nexusSlideUp 0.25s ease; }
      @keyframes nexusSlideUp {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      #nexus-chat-header {
        padding: 14px 16px;
        background: linear-gradient(135deg, #0c2340, #163a5f);
        color: #fff;
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
      }
      #nexus-chat-header-info strong { display: block; font-size: 14px; }
      #nexus-chat-header-info span { font-size: 11px; opacity: 0.75; }
      #nexus-chat-close {
        background: rgba(255,255,255,0.1); border: none; cursor: pointer;
        color: #fff; padding: 6px; border-radius: 8px; line-height: 0;
      }
      #nexus-chat-close:hover { background: rgba(255,255,255,0.2); }
      #nexus-chat-messages {
        flex: 1; padding: 14px; overflow-y: auto;
        display: flex; flex-direction: column; gap: 10px;
        background: #f8fafc;
      }
      .nexus-chat-msg {
        padding: 10px 14px; border-radius: 14px;
        max-width: 88%; white-space: pre-wrap; word-wrap: break-word;
        font-size: 15px; line-height: 1.55;
      }
      .nexus-chat-msg.user {
        background: #0c2340; color: #fff;
        align-self: flex-end; border-bottom-right-radius: 4px;
      }
      .nexus-chat-msg.bot {
        background: #fff; color: #334155;
        align-self: flex-start;
        border: 1px solid #e2e8f0;
        border-bottom-left-radius: 4px;
      }
      #nexus-chat-suggestions {
        display: flex; flex-wrap: wrap; gap: 6px;
        padding: 8px 14px; background: #fff;
        border-top: 1px solid #e2e8f0;
      }
      .nexus-suggestion {
        font-size: 12px; padding: 6px 12px;
        background: #eff6ff; color: #163a5f;
        border: 1px solid #bfdbfe; border-radius: 999px;
        cursor: pointer; font-family: inherit;
        transition: background 0.15s;
      }
      .nexus-suggestion:hover { background: #dbeafe; }
      #nexus-chat-form {
        display: flex; gap: 8px; align-items: center;
        border-top: 1px solid #e2e8f0; background: #fff; padding: 10px 12px;
      }
      #nexus-chat-input {
        flex: 1; border: 1px solid #e2e8f0; outline: none;
        padding: 10px 12px; font-size: 14px; border-radius: 10px;
        font-family: inherit; color: #0f172a; background: #f8fafc;
      }
      #nexus-chat-input:focus { border-color: #d97706; background: #fff; }
      #nexus-chat-send {
        border: none; background: #d97706; color: #fff;
        padding: 10px 14px; cursor: pointer; border-radius: 10px;
        font-size: 13px; font-weight: 600; font-family: inherit;
        white-space: nowrap;
      }
      #nexus-chat-send:hover { background: #b45309; }
      #nexus-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
      .nexus-chat-typing span {
        width: 6px; height: 6px; border-radius: 50%; background: #94a3b8;
        display: inline-block; margin: 0 2px;
        animation: nexusBounce 1.2s ease-in-out infinite;
      }
      .nexus-chat-typing span:nth-child(2) { animation-delay: 0.15s; }
      .nexus-chat-typing span:nth-child(3) { animation-delay: 0.3s; }
      @keyframes nexusBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-4px); opacity: 1; }
      }
      @media (max-width: 768px) {
        #nexus-chat-toggle {
          width: 62px; height: 62px;
          right: max(12px, env(safe-area-inset-right));
          bottom: max(12px, env(safe-area-inset-bottom));
        }
        #nexus-chat-toggle svg { width: 28px; height: 28px; }
        #nexus-chat-panel {
          right: 0; left: 0; bottom: 0;
          width: 100%; max-width: 100%;
          height: 100%; max-height: 100%;
          border-radius: 0;
          font-size: 17px;
        }
        #nexus-chat-header { padding: 16px 18px; }
        #nexus-chat-header-info strong { font-size: 17px; }
        #nexus-chat-header-info span { font-size: 13px; }
        #nexus-chat-close { padding: 10px; }
        #nexus-chat-messages { padding: 16px; gap: 12px; }
        .nexus-chat-msg {
          font-size: 16px; line-height: 1.6;
          padding: 12px 16px; max-width: 92%;
        }
        #nexus-chat-suggestions { padding: 10px 14px; gap: 8px; }
        .nexus-suggestion {
          font-size: 13px; padding: 8px 14px;
          min-height: 36px;
        }
        #nexus-chat-form { padding: 12px 14px; gap: 10px; }
        #nexus-chat-input {
          font-size: 16px; padding: 12px 14px;
          min-height: 48px;
        }
        #nexus-chat-send {
          font-size: 15px; padding: 12px 18px;
          min-height: 48px;
        }
      }
    `;
    document.head.appendChild(style);

    const toggle = document.createElement("button");
    toggle.id = "nexus-chat-toggle";
    toggle.setAttribute("aria-label", "Abrir assistente IA");
    toggle.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>`;
    document.body.appendChild(toggle);

    const panel = document.createElement("div");
    panel.id = "nexus-chat-panel";
    panel.innerHTML = `
      <div id="nexus-chat-header">
        <div id="nexus-chat-header-info">
          <strong>Assistente Nexus</strong>
          <span>IA gratuita · pergunte sobre o plano</span>
        </div>
        <button id="nexus-chat-close" type="button" aria-label="Fechar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div id="nexus-chat-messages"></div>
      <div id="nexus-chat-suggestions"></div>
      <form id="nexus-chat-form">
        <input id="nexus-chat-input" type="text" placeholder="Pergunte sobre o plano financeiro..." autocomplete="off" />
        <button id="nexus-chat-send" type="submit">Enviar</button>
      </form>
    `;
    document.body.appendChild(panel);

    const messagesEl = panel.querySelector("#nexus-chat-messages");
    const suggestionsEl = panel.querySelector("#nexus-chat-suggestions");
    const form = panel.querySelector("#nexus-chat-form");
    const input = panel.querySelector("#nexus-chat-input");
    const sendBtn = panel.querySelector("#nexus-chat-send");
    const closeBtn = panel.querySelector("#nexus-chat-close");

    const pageSnippet = document.body.innerText.replace(/\s+/g, " ").slice(0, 4000);

    const conversation = [{
      role: "system",
      content: `Você é o assistente de estudo do Plano Financeiro da Nexus Soluções Industriais (trabalho CESURG).
Responda SEMPRE em português do Brasil, de forma clara e direta, como um colega ajudando a estudar para a apresentação.
Use os dados abaixo como fonte da verdade. Se não souber, diga que não está no material.
Priorize números concretos (R$, %, dias) quando relevante.
IMPORTANTE: seja BREVE. Máximo 6-8 linhas por resposta, salvo se pedirem "detalhe" ou "completo".
Use parágrafos curtos. Evite listas enormes.
Ajude com: diagnóstico, plano de ação, impacto financeiro, apresentação e perguntas da banca.
Não invente dados fora do material.

BASE DE CONHECIMENTO:
${KNOWLEDGE}

TEXTO ADICIONAL DA PÁGINA:
${pageSnippet}`,
    }];

    function addMessage(role, text) {
      const el = document.createElement("div");
      el.className = "nexus-chat-msg " + role;
      el.textContent = text;
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return el;
    }

    addMessage("bot", "Olá! Sou o assistente do plano financeiro da Nexus. Pergunte sobre margem, frete, crédito, apresentação ou o que a banca pode perguntar.\n\nNa primeira mensagem pode aparecer um login do Puter (gratuito) — é só para liberar a IA.");

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
      toggle.classList.toggle("open", open);
      if (open) input.focus();
    }

    toggle.addEventListener("click", () => setOpen(!panel.classList.contains("open")));
    closeBtn.addEventListener("click", () => setOpen(false));

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
          botEl.textContent = "Não consegui gerar uma resposta. Tente reformular a pergunta.";
          conversation.pop();
        } else {
          conversation.push({ role: "assistant", content: answer });
        }
      } catch (err) {
        botEl.textContent = "Erro: " + (err.message || "tente novamente. Se for a primeira vez, aceite o login do Puter no popup.");
        conversation.pop();
      } finally {
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
