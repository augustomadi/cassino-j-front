# Planejamento de Endpoints da API — Cassino-J

Documento de referência com o desenho dos endpoints da API (site público e
painel admin), organizado por módulo do produto.

## Parte 1 — Endpoints de API (site público)

Convenção proposta: REST, JSON, prefixo `/api/v1`, autenticação via Bearer token
(ex: Laravel Sanctum se o backend PHP for Laravel). Endpoints marcados **(público)**
não exigem login.

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastro (nome, email, CPF, senha, nascimento p/ validar +18, telefone) |
| POST | `/auth/login` | Login (email/senha) → token + dados básicos do usuário |
| POST | `/auth/logout` | Invalida o token atual |
| POST | `/auth/refresh` | Renova token de sessão |
| POST | `/auth/password/forgot` | Solicita recuperação de senha (envia email/SMS com link ou código) |
| POST | `/auth/password/reset` | Confirma nova senha usando token recebido |
| POST | `/auth/email/verify` | Confirma verificação de email (comum em compliance de cassino) |

### Usuário
| Método | Rota | Descrição |
|---|---|---|
| GET | `/me` | Dados do usuário logado (nome, status, KYC, etc.) |
| PATCH | `/me` | Atualiza dados de perfil |
| GET | `/me/balance` | Saldo atual (endpoint separado, chamado com frequência) |
| POST | `/me/kyc` | Envio de documentos para verificação (necessário antes de saque, tipicamente) |
| GET | `/me/transactions` | Extrato: depósitos, saques, apostas, ganhos |

### Depósito
| Método | Rota | Descrição |
|---|---|---|
| GET | `/deposits/methods` | Métodos disponíveis (PIX, cartão, boleto, cripto) e limites min/máx |
| POST | `/deposits` | Cria intenção de depósito (`method`, `amount`) → retorna dado de pagamento (QR PIX, form de cartão, etc.) |
| GET | `/deposits/:id` | Status de um depósito específico |
| POST | `/webhooks/payments/:provider` | Webhook server-to-server do gateway confirmando pagamento (não é chamado pelo front) |

### Saque
| Método | Rota | Descrição |
|---|---|---|
| GET | `/withdrawals/methods` | Métodos e limites disponíveis para saque |
| POST | `/withdrawals` | Solicita saque (`method`, `amount`, chave PIX, etc.) |
| GET | `/withdrawals` | Histórico/status dos saques do usuário |
| DELETE | `/withdrawals/:id` | Cancela saque ainda pendente |

### Jogos
| Método | Rota | Descrição |
|---|---|---|
| GET | `/games` **(público)** | Lista jogos, com filtro por categoria (cassino/egames), provider, busca e paginação |
| GET | `/games/:id` **(público)** | Detalhe de um jogo |
| GET | `/providers` **(público)** | Lista de provedores |
| POST | `/games/:id/launch` | Abre sessão de jogo — tipicamente delega a um agregador terceiro de jogos (PG Soft/Pragmatic/etc via API) e retorna URL/token de sessão |
| GET | `/games/:id/rounds` | Histórico de rodadas/apostas do usuário naquele jogo (opcional) |
| GET | `/winners/recent` **(público)** | Ganhos recentes — alimenta o Winners Ticker |
| GET | `/winners/top` **(público)** | Top ganhadores da semana — alimenta o Top Ganhos |

### Home agregada (opcional)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/home` **(público)** | Endpoint agregador opcional: banners + destaques + top games num payload único, para reduzir round-trips no carregamento da Home |

> Nota sobre `/games/:id/launch`: em plataformas de cassino real, o catálogo de
> jogos normalmente vem de um **agregador terceirizado** (fornece a lista de jogos
> e a URL/iframe de lançamento), não são jogos implementados internamente. Vale
> confirmar com o usuário se já há um agregador escolhido, pois isso muda bastante
> o desenho de `/games` e `/games/:id/launch`.

---

## Parte 2 — Endpoints de API (Painel Admin)

Convenção: mesmo padrão da Parte 1 (`REST`, JSON, prefixo `/api/v1`, Bearer token).
Todas as rotas abaixo exigem sessão de **staff admin** autenticado (não é o token
de usuário do site).


### Autenticação do Admin
| Método | Rota | Descrição |
|---|---|---|
| POST | `/admin/auth/login` | Login do staff (email/senha) → token de sessão admin |
| POST | `/admin/auth/logout` | Encerra sessão admin |
| GET | `/admin/me` | Dados do staff logado (nome, papel/role) |


### Dashboard
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/dashboard/kpis?period=7\|30\|90` | GGR, NGR, caixa, usuários ativos/online, depósitos, saques , saques pendentes , taxa de conversão |
| GET | `/admin/dashboard/revenue-series?period=` | Série diária de depósitos x saques x GGR (gráfico) |
| GET | `/admin/dashboard/activity-feed` | Feed de eventos recentes (depósito, saque, vitória grande, novo cadastro, alerta de risco) |
| GET | `/admin/dashboard/top-games?limit=` | Ranking rápido de jogos por GGR (mesma fonte de `/admin/games/performance`) |

### Financeiro
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/finance/kpis` | Saldo em caixa, receita/despesas do ano, lucro líquido e margem |
| GET | `/admin/finance/pnl?period=monthly` | Série de receita x despesa por mês (P&L) |
| GET | `/admin/finance/payment-methods` | Distribuição de depósitos por método (PIX/cartão/boleto/cripto) |
| GET | `/admin/finance/expenses` | Lista de despesas operacionais (por categoria) |
| POST | `/admin/finance/expenses` | Cadastra nova despesa |
| PATCH | `/admin/finance/expenses/:id` | Edita uma despesa |
| DELETE | `/admin/finance/expenses/:id` | Remove uma despesa |



### Transações
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/transactions` | Lista paginada, filtros por tipo (depósito/saque/aposta/ganho/bônus), status, usuário/ID, período |
| GET | `/admin/transactions/:id` | Detalhe de uma transação |
| GET | `/admin/transactions/export?format=csv` | Exportação do histórico filtrado (opcional) |

### Jogos (analytics)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/games/performance?period=` | Ranking de jogos: total apostado, GGR gerado, jogadores únicos, margem (house edge) |


### Configurações
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/settings` | Retorna configurações atuais da plataforma |
| PUT | `/admin/settings` | Atualiza configurações: nome da plataforma, depósito mínimo, rollover de bônus, saque mínimo , limite de saque diário , valor de auto-aprovação de saque  |

---

## Parte 3 — Endpoints de API (Afiliados)

**Modelo de negócio confirmado com o usuário:**
- Só **RevShare** — comissão é sempre uma % sobre a **perda líquida** dos jogadores
  que aquele afiliado indicou (não existe CPA/valor fixo).
- **Perda líquida do jogador** = total apostado − total pago em prêmios (GGR
  gerado por ele), no período. *(assumindo essa definição — não é depósito menos
  saque, que tem timing diferente; vale confirmar com o usuário antes de
  implementar.)*
- **Fechamento mensal**: a perda de cada jogador indicado é apurada por mês,
  multiplicada pela % do afiliado, e vira a comissão daquele mês.
- Se no mês o jogador **ganhar mais do que perdeu** (perda negativa), esse saldo
  negativo **não zera** — vira carry-over e desconta da comissão do afiliado no
  mês seguinte.
- Exemplo do usuário: afiliado com 20% de comissão, jogador indicado deposita
  R$120, perde R$100 no mês → comissão do afiliado no fechamento daquele mês =
  R$20.

### Gestão de Afiliados
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/affiliates` | Lista afiliados: cliques, cadastros, perda gerada no mês atual, comissão do mês atual, saldo em aberto (com carry-over), status |
| POST | `/admin/affiliates` | Cria novo afiliado (nome, % de comissão) → gera código e link únicos automaticamente |
| GET | `/admin/affiliates/:id` | Detalhe de um afiliado |
| PATCH | `/admin/affiliates/:id` | Edita nome, % de comissão ou status (ativo/pausado) |
| GET | `/admin/affiliates/:id/referrals` | Lista de jogadores vinculados a esse afiliado, com perda do período atual de cada um |

### Fechamento e Pagamento de Comissão
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/affiliates/:id/statements` | Histórico de fechamentos mensais (período, perda apurada, comissão calculada, carry-over anterior, comissão líquida do mês, status: aberto/fechado/pago) |
| GET | `/admin/affiliates/:id/statements/:period` | Detalhe de um fechamento — drill-down por jogador indicado naquele mês |
| POST | `/admin/affiliates/:id/statements/:period/close` | Fecha o período: congela o cálculo daquele mês e computa o carry-over (se negativo) para o próximo |
| POST | `/admin/affiliates/:id/statements/:period/pay` | Marca o fechamento como pago (registra valor pago e data) |
| GET | `/admin/affiliates/:id/payouts` | Histórico de pagamentos já realizados a esse afiliado |
| POST | `/admin/affiliates/statements/run?period=` | Roda o fechamento mensal para **todos** os afiliados de uma vez (job periódico/cron) |

### Atribuição de indicação (público, usado pelo site)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/r/:code` | Link público de afiliado — registra o clique e marca a atribuição (cookie/param) antes de redirecionar pro site |

> Ajuste necessário na Parte 1: `POST /auth/register` precisa aceitar um campo
> `ref` (código do afiliado) para vincular o novo usuário ao afiliado que o
> indicou — esse vínculo é o que alimenta `/admin/affiliates/:id/referrals`.

---

## Parte 4 — Endpoints de API (Saque de Usuários / Conta do Cassino)

**Modelo de negócio confirmado com o usuário:**
- Existe uma **conta do cassino** (saldo real em dinheiro) que sobe com cada
  depósito confirmado e desce com cada saque pago. O saldo dessa conta é
  **editável manualmente** pelo admin (ex: quando ele retira dinheiro fisicamente
  da conta pra uso próprio, precisa refletir isso no painel).
- Existe um **limite de saque automático** (ex: R$100), definido pelo admin.
  Enquanto houver saldo dentro desse limite, os saques dos usuários são **pagos
  automaticamente, sem aprovação manual**.
- Cada saque automático processado consome esse limite. Quando o consumido atinge
  o limite definido, **todos os saques seguintes ficam travados**, aguardando
  aprovação manual do admin.
- O admin destrava de duas formas: (a) aprova manualmente os saques travados um a
  um, ou (b) define um **novo limite** — o que zera o contador do ciclo anterior e
  inicia um novo ciclo de saque automático.
- Confirmado: o limite de saque automático é livre para o admin definir, **mas
  nunca pode ultrapassar o saldo atual em conta do cassino** (não é possível
  autorizar mais saque automático do que existe de fato em conta). Como essa
  validação já acontece na hora de definir o limite, o saque automático **não
  precisa checar o saldo da conta de novo a cada saque** — só controla o
  consumo contra o limite do ciclo.
- Se a conta (e por consequência o limite) estiver **zerada**, a tentativa de
  saque deve **retornar erro** avisando que não há saldo disponível — tanto para
  saque automático quanto para aprovação manual (a aprovação manual também
  respeita o saldo da conta; não é possível aprovar saque sem saldo suficiente).

### Conta do Cassino
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/cash-account` | Saldo atual em conta, total histórico de depósitos, total histórico de saques pagos, último ajuste manual |
| PATCH | `/admin/cash-account` | Ajuste manual do saldo (`amount`, `reason`) — usado quando o admin movimenta dinheiro fora do sistema |
| GET | `/admin/cash-account/adjustments` | Histórico de ajustes manuais (quem fez, quando, valor, motivo) — auditoria |

### Limite de Saque Automático
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/withdrawals/auto-limit` | Estado do ciclo atual: limite definido, quanto já foi consumido, quanto resta, se está travado |
| PUT | `/admin/withdrawals/auto-limit` | Define novo limite (`amount`) — valida que `amount <= saldo em conta`; zera o consumido e inicia novo ciclo |
| GET | `/admin/withdrawals/auto-limit/history` | Histórico de ciclos anteriores (limite definido, quanto foi consumido, quando travou, quando foi substituído) |

### Saques
| Método | Rota | Descrição |
|---|---|---|
| POST | `/withdrawals` *(site, Parte 1)* | Usuário solicita saque. Backend decide automaticamente: se couber no limite automático restante → processa e paga na hora, debitando a conta; se o limite estiver esgotado → fica `aguardando_aprovacao`; se a **conta do cassino estiver zerada**, retorna erro informando que não há saldo disponível |
| GET | `/admin/withdrawals` | Lista de saques (filtro por status: pago automaticamente / aguardando aprovação / aprovado manualmente / recusado) |
| GET | `/admin/withdrawals/:id` | Detalhe de um saque |
| POST | `/admin/withdrawals/:id/approve` | Aprova manualmente um saque travado — debita a conta do cassino e marca como pago. Retorna erro se o saldo da conta for insuficiente para cobrir o valor |
| POST | `/admin/withdrawals/:id/reject` | Recusa um saque travado — devolve o valor ao saldo do usuário |


