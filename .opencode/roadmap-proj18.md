# Roadmap — Project 18 (Melhorias de alto impacto, propósito central)

Fonte: `project18.md` · `prd-project18.md` (como). Gates por fase conforme §19
do Plan.md; revisor: agente principal (subagentes read-only verificam
conformidade — PRD §7). Onda 1: s1 (F0) · s2 (F5) · s3 (F6). Onda 2: s4 (F1+F2)
· s5 (F3) · s6 (F4 + blueprint read_fib_bank). Onda 3: s7 (F7). Fechamento:
agente principal.

## Fase 0 · Integridade crítica (D18-0a/b/c) — s1
- [ ] D18-0a HIW: transcript falado distinto nos 3 itens (diverge em `errors`),
      loader sem fallback transcript→text para lst_hiw, item sem transcript
      distinto fora das filas + teste de contrato
- [ ] D18-0b paridade oral: gradeSpeechQuestion retorna gradable; veredito
      decideOralVerdict no widget de fala do exame (not_gradable → null) + teste
- [ ] D18-0c retry IA: AiGradeFeedback com "Tentar novamente" no estado
      indisponível; botão do exame sobrevive à falha + teste de componente
- Gates: vitest (novos) · tsgo limpo · build OK · lint 0/0 · Playwright
  (practice hiw + exam) console limpo, axe 0, 390×844 overflow 0

## Fase 5 · Vocabulário produtivo e mescla justa (D18-5) — s2
- [ ] D18-5a lastReviewTs opcional em VocabWord/VocabPhrase + cursor de rotação
      de sentidos persistido por entrada + teste da 2ª fila com sentido distinto
- [ ] D18-5b merge de backup por evidência de revisão (lastReviewTs mais
      recente vence; fallback = regra antiga) + testes do caso do lapso
- Gates: vitest (novos) · tsgo limpo · build OK · lint 0/0 · Playwright
  (vocabulary) console limpo, axe 0, 390×844 overflow 0

## Fase 6 · Novo tipo read_fib_bank (D18-6) — s3
- [ ] D18-6a TaskType + TYPE_META + schema próprio + loader/catálogo + ≥ 8
      itens iniciais (fonte honesta) + build-manifest regenerado + teste de
      contagem derivada
- [ ] D18-6b FibBankPractice (arrastar/tocar + teclado acessível, gabarito,
      nota) adotado no dispatch da prática e no SectionPage (derivação)
- Gates: vitest (novos) · tsgo limpo · build OK (manifest/precache) · lint 0/0 ·
  Playwright (nova prática + /reading) console limpo, axe 0, 390×844 overflow 0

## Fase 1 · IA no SST (D18-1) — s4
- [ ] D18-1 kind "sst" em runAiGrade/schemas/prompts/handler server-only;
      SstPractice via AiGradeFeedback; score de progresso continua o local +
      testes (schema, erro tipado, cache-first, gravação de dimensões <70)
- Gates: vitest (novos) · tsgo limpo · build OK · lint 0/0 · Playwright (sst)

## Fase 2 · Recomendação v2 (D18-2) — s4
- [ ] D18-2 next-action lê targetScore/examDate/correção pendente/tipos nunca
      tentados (ação de diagnóstico rotulada) + testes com valores concretos
- Gates: vitest (novos) · tsgo limpo · build OK · lint 0/0 · Playwright
  (home + progress)

## Fase 3 · Readiness honesto (D18-3) — s5
- [ ] D18-3 confiança exige diversidade (itens únicos) + transferência (itens
      inéditos); repetição não sobe confiança; aviso de frescor > 14 dias +
      testes (inclusive não-regressão dos rótulos)
- Gates: vitest (novos) · tsgo limpo · build OK · lint 0/0 · Playwright (progress)

## Fase 4 · Revisão fiel do simulado (D18-4) — s6
- [ ] D18-4 resposta submetida + causa persistidas por questão (cap 2.000);
      revisão reconstrói do registro persistido após reload; referenceFor com
      caso essay; caps 500→2.000/300→600 + testes + blueprint read_fib_bank
- Gates: vitest (novos) · tsgo limpo · build OK · lint 0/0 · Playwright (revisão)

## Fase 7 · Conteúdo de alto impacto (D18-7) — s7
- [ ] D18-7a pisos de banco: describe_image ≥ 20 · lst_hcs/hiw/smw/mcq_multi
      ≥ 10 · lst_mcq ≥ 12 · mcq_multi ≥ 30 · sgd ≥ 20 · read_fib_bank ≥ 8 +
      testes de contrato + dedupe (canonical-map) + manifest regenerado
- [ ] D18-7b samples para retell_lecture e summarize_spoken_text (mínimo 30
      por banco ou todos, por qualidade) + revisão em amostra pelo principal
- Gates: vitest (novos) · tsgo limpo · build OK · lint 0/0 · Playwright smoke

## Fase 8 · Fechamento (D18-F8) — agente principal
- [ ] D18-F8a E2E `scripts/e2e/proj18_f8.py` (fluxos: HIW, retry IA, SST IA
      mock, revisão pós-reload, rotação de sentidos, read_fib_bank) + varredura
      390×844 + axe 0 nas rotas tocadas — JSON no stdout, exit 1 em falha
- [ ] D18-F8b gates finais + AGENTS.md raiz (regras estruturais novas) +
      memória do projeto + estado exato no roadmap central
- Gates: vitest total · tsgo limpo · build OK · lint 0/0 · E2E exit 0 ·
  relato nos três blocos

Estado: NENHUMA fase concluída ainda. Próximo passo: onda 1 (s1, s2, s3).
