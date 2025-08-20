# 🎯 Sistema 90/10 Raspadinha - Instruções Completas

## 📊 STATUS ATUAL
✅ **ETAPA 0** - Backup e feature flag criados  
✅ **ETAPA 1** - Migrações de banco implementadas  
✅ **ETAPA 2** - Presets de operação criados  
✅ **ETAPA 3** - Funções SQL utilitárias implementadas  
✅ **ETAPA 4** - Edge Function preparada para upgrade  
✅ **ETAPA 5** - Interface Admin consolidada integrada  
🔲 **ETAPA 6** - Testes sequenciais (PRÓXIMO PASSO)  
🔲 **ETAPA 7** - Ativação controlada  

---

## 🔧 ETAPA 6 - TESTES SEQUENCIAIS

### 6.1 **SMOKE TEST** - Verificação Básica (5min)
```bash
# 1. Acesse o Admin (/admin)
# 2. Vá para aba "Raspadinha" 
# 3. Verifique se a interface carrega sem erros
# 4. Sistema deve mostrar: "Sistema desabilitado por segurança"
```

**✅ Critério de Sucesso:** Interface carrega, feature flag funciona

### 6.2 **PRESET TEST** - Templates Operacionais (10min)
```sql
-- Execute no SQL Editor do Supabase para ativar temporariamente:
UPDATE app_settings SET setting_value = 'true' WHERE setting_key = 'enable_new_scratch_ui';
```

**Teste na Interface:**
1. Aba "Raspadinha" → Seção "Configurações"
2. Selecione uma raspadinha existente
3. Clique "Aplicar Preset" → Escolha "90/10"
4. Verifique: `win_probability_global = 10%`
5. Seção "Controle da Banca" → `pay_upto_percentage = 90%`

**✅ Critério de Sucesso:** Preset aplica corretamente

### 6.3 **PROBABILITY PIVOT TEST** - Gestão Granular (15min)
1. Aba "Probabilidades" 
2. Edite peso de um item: `probability_weight = 25.50`
3. Altere `active = false` em outro
4. Teste Export/Import CSV
5. Verifique se mudanças são salvas

**✅ Critério de Sucesso:** CRUD completo funcional

### 6.4 **SIMULATION TEST** - "Testar como..." (10min)
1. Configurações → Selecione raspadinha
2. "Testar como..." → Escolha um usuário
3. Execute simulação 5x
4. Verifique Logs → Eventos tipo `SCRATCH_TEST`
5. Confirme que dados aparecem em `event_log`

**✅ Critério de Sucesso:** Simulação executa e loga

### 6.5 **BANK CONTROL TEST** - Controle Financeiro (10min)
1. Controle da Banca → Modo "percentage"
2. Defina `pay_upto_percentage = 50%`
3. Execute simulação de vitória alta
4. Sistema deve bloquear se exceder 50% do saldo
5. Teste modo "balance_min" também

**✅ Critério de Sucesso:** Limites de payout respeitados

### 6.6 **REAL GAME TEST** - Jogo Real SEM Pagamentos (20min)
⚠️ **CUIDADO:** Este teste usa saldo real, mas custos reduzidos

```sql
-- Temporarily set backend_cost muito baixo para teste:
UPDATE scratch_card_settings 
SET backend_cost = 0.01 
WHERE scratch_type = 'test_scratch';
```

**Teste Real:**
1. Jogue 10x com usuário real
2. Verifique debito usa `backend_cost` (0.01)
3. Confirme vitórias respeitam `payout_mode`
4. Logs mostram `SCRATCH_PLAY` (não SCRATCH_TEST)

**✅ Critério de Sucesso:** Lógica financeira correta

---

## 🚀 ETAPA 7 - ATIVAÇÃO CONTROLADA

### 7.1 **PRÉ-ATIVAÇÃO** - Checklist Final
```sql
-- ✅ Verificar dados básicos existem:
SELECT count(*) FROM scratch_card_settings;
SELECT count(*) FROM scratch_card_presets;
SELECT count(*) FROM event_log WHERE event_type = 'SCRATCH_TEST';

-- ✅ Backup das configurações atuais:
CREATE TABLE scratch_settings_backup AS 
SELECT * FROM scratch_card_settings;
```

### 7.2 **ATIVAÇÃO GRADUAL**
```sql
-- 🔄 STAGE 1: Ativar apenas para admins (teste interno)
UPDATE app_settings 
SET setting_value = 'true' 
WHERE setting_key = 'enable_new_scratch_ui';
```

**Monitore por 2-4 horas:**
- Logs de erro no console
- Performance da interface
- Comportamento dos presets

```sql
-- 🔄 STAGE 2: Configurar raspadinhas principais
-- Definir preços diferenciados para cada uma:
UPDATE scratch_card_settings SET
  price_display = 5.00,
  backend_cost = 4.50,
  win_probability_global = 12.5
WHERE scratch_type = 'premium_scratch';

UPDATE scratch_card_settings SET
  price_display = 2.00, 
  backend_cost = 1.80,
  win_probability_global = 15.0
WHERE scratch_type = 'basic_scratch';
```

### 7.3 **ATIVAÇÃO COMPLETA**
```sql
-- 🟢 FINAL: Sistema totalmente ativo
-- Aplicar preset 90/10 a todas raspadinhas principais:
SELECT apply_preset_to_scratch(id, 2) -- preset "90/10"
FROM scratch_card_settings 
WHERE is_active = true;
```

---

## 🔄 ROLLBACK DE EMERGÊNCIA

### ROLLBACK SIMPLES (Interface)
```sql
-- ❌ Desabilita apenas a UI nova, mantém dados:
UPDATE app_settings 
SET setting_value = 'false' 
WHERE setting_key = 'enable_new_scratch_ui';
```

### ROLLBACK COMPLETO (Dados)
```sql
-- ⚠️ SOMENTE EM EMERGÊNCIA - restaurar backup:
DELETE FROM scratch_card_settings;
INSERT INTO scratch_card_settings SELECT * FROM scratch_settings_backup;

-- Limpar logs de teste:
DELETE FROM event_log WHERE event_type IN ('SCRATCH_TEST', 'SCRATCH_PRESET_APPLIED');
```

---

## 📈 MONITORAMENTO PÓS-ATIVAÇÃO

### Queries de Monitoramento
```sql
-- 📊 Performance das raspadinhas (última hora):
SELECT 
  s.name,
  s.backend_cost,
  s.price_display,
  count(*) as jogadas,
  sum(case when has_win then 1 else 0 end) as vitorias,
  avg(s.backend_cost) as custo_medio
FROM scratch_card_games g
JOIN scratch_card_settings s ON s.scratch_type = g.scratch_type  
WHERE g.created_at > now() - interval '1 hour'
GROUP BY s.id, s.name, s.backend_cost, s.price_display;

-- 🚨 Alertas de controle da banca:
SELECT *
FROM scratch_card_financial_control 
WHERE (total_prizes_given / NULLIF(total_sales, 0)) > (pay_upto_percentage / 100.0)
  AND date = current_date;

-- 📋 Log de eventos críticos:
SELECT * FROM event_log 
WHERE event_type IN ('SCRATCH_PRESET_APPLIED', 'BANK_CONTROL_UPDATED')
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;
```

### Métricas de Sucesso
- **Conversão:** Mantém taxa de jogadas atual
- **Margem:** `backend_cost` vs `price_display` otimizado  
- **Controle:** Payouts respeitam limites definidos
- **Operação:** Admins conseguem ajustar presets rapidamente

---

## ⚡ FUNCIONALIDADES PRINCIPAIS

### 🎮 **Para Operação (Admins)**
- **Presets Rápidos:** 95/05, 90/10, 85/15, 80/20
- **Preços Flexíveis:** Vitrine vs Custo Real
- **Probabilidades:** Global, Influencer, Normal  
- **Controle da Banca:** % ou Saldo Mínimo
- **Simulação:** Testa como qualquer usuário
- **Logs Completos:** Auditoria total

### 🔧 **Para Tech (Desenvolvedores)**  
- **Feature Flag:** Rollback instantâneo
- **SQL Utilitários:** Funções reutilizáveis
- **Event Logging:** Rastreamento unificado
- **Edge Function:** Preparada para lógica 90/10
- **Admin Interface:** Consolidada e otimizada

### 💰 **Para Financeiro**
- **Margens Reais:** Custo backend separado da vitrine
- **Controle de Payout:** Múltiplos modos de operação  
- **Relatórios:** Lucro líquido real-time
- **Auditoria:** Todos eventos logados
- **Segurança:** Limites automáticos

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **EXECUTAR ETAPA 6** - Todos os testes sequenciais
2. **BACKUP COMPLETO** - Antes da ativação
3. **ATIVAÇÃO GRADUAL** - Stage 1 → Stage 2 → Final
4. **MONITORAMENTO** - Primeiras 48h críticas
5. **OTIMIZAÇÃO** - Ajustar presets conforme dados

---

## 💬 SUPORTE E TROUBLESHOOTING

### Problemas Comuns:
- **Interface não carrega:** Verificar feature flag
- **Presets não aplicam:** Conferir RLS policies  
- **Simulação falha:** Validar usuário existe
- **Logs não aparecem:** Conferir `event_log_add()` function

### Contatos Técnicos:
- **Database:** Verificar migrações aplicadas
- **Frontend:** Checar console do navegador  
- **Backend:** Logs das Edge Functions
- **Financeiro:** Queries de monitoramento

---

**🔐 Sistema pronto para ativação controlada!**