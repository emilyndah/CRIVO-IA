# Contrato de Integração da API: Crivo (FastAPI ⇄ Frontend)

Este documento especifica formalmente todos os endpoints REST que o backend **FastAPI** (`src/api/main.py`) deve expor para consumo do frontend.

> **Importante:** Todo o escopo é **exclusivamente hídrico** (água em m³ e faturas em R$). Qualquer dado de energia elétrica foi descartado do produto.

---

## 1. Diretrizes Globais

- **Prefixo dos endpoints:** `/api/v1`
- **Formato de payload:** `application/json; charset=utf-8`
- **Autenticação:** Cookie HTTP-only com token de sessão seguro (`session_id` ou `access_token`), com `SameSite=Lax` e `Secure` em produção.
- **CORS:** Permitir origem do frontend (`http://localhost:5173` em dev) com `credentials=True`.

---

## 2. Autenticação e Sessão

### `GET /api/v1/auth/me`
Retorna os dados do usuário autenticado a partir do cookie de sessão.

**Resposta (200 OK):**
```json
{
  "id": "usr-1",
  "nome": "Samuel Faleiro",
  "email": "samuel@crivo.ia",
  "cargo": "Síndico / Gestor Predial"
}
```
**Resposta (401 Unauthorized):** Não autenticado.

---

### `POST /api/v1/auth/login`
Autentica o gestor predial e define o cookie de sessão.

**Requisição:**
```json
{
  "email": "samuel@crivo.ia",
  "senha": "string"
}
```
**Resposta (200 OK):** Objeto `Usuario` + header `Set-Cookie`.

---

### `POST /api/v1/auth/register`
Cria a conta do gestor e inicializa o condomínio/prédio.

**Requisição:**
```json
{
  "nome": "Carlos Eduardo Mendes",
  "email": "carlos@condominio.com",
  "senha": "string",
  "nomePredio": "Residencial Parque das Flores",
  "tipoPredio": "condominio" // "condominio" | "escola" | "saude" | "comercio"
}
```
**Resposta (201 Created):** Objeto `Usuario` + header `Set-Cookie`.

---

### `POST /api/v1/auth/logout`
Encerra a sessão e expira o cookie.

**Resposta (200 OK):**
```json
{ "ok": true }
```

---

## 3. Prédio e Imóvel

### `GET /api/v1/predio`
Retorna as configurações do prédio associado ao gestor logado.

**Resposta (200 OK):**
```json
{
  "id": "prd-1",
  "nome": "Condomínio Exemplo",
  "tipo": "condominio",
  "cidade": "Anápolis",
  "estado": "GO",
  "quantidadeUnidades": 64,
  "tarifaVigenteAgua": 10.0,
  "criadoEm": "2026-06-01T08:00:00Z"
}
```

### `PATCH /api/v1/predio`
Atualiza dados cadastrais ou a tarifa de água vigente.

---

## 4. Resultado e Diagnóstico do Mês (IA + Linha de Base)

### `GET /api/v1/resultado/{mes}`
Retorna o diagnóstico preditivo decomposto do mês especificado no formato `AAAA-MM` (ex: `2026-08`).

**Resposta (200 OK):**
```json
{
  "mes": "2026-08",
  "valorPago": 187.0,
  "esperado": 165.0,
  "reajusteTarifa": 8.0,
  "usoAcimaDoEsperado": 14.0,
  "mesesSeguidosAlta": 3,
  "mensagem": "Sua conta subiu R$ 22. R$ 8 foi tarifa, R$ 14 foi uso. É o 3º mês seguido de alta, vale checar vazamento.",
  "tomMensagem": "alerta", // "alerta" | "ok" | "neutro"
  "unidadesParecidas": [
    { "nome": "Apto 101", "valorPago": 160.0 },
    { "nome": "Apto 202", "valorPago": 171.0 },
    { "nome": "Apto 302, acima das parecidas", "valorPago": 187.0, "destaque": true, "nota": "Dados de exemplo." }
  ],
  "alertasDesteMes": [
    {
      "id": "alt-1",
      "titulo": "Uso alto 3 meses seguidos",
      "descricao": "Água, desde junho. Possível vazamento.",
      "tipo": "alta",
      "criadoEm": "2026-08-25T10:00:00Z"
    },
    {
      "id": "alt-2",
      "titulo": "Reajuste de tarifa aplicado",
      "descricao": "Já considerado no cálculo deste mês.",
      "tipo": "tarifa",
      "criadoEm": "2026-08-01T00:00:00Z"
    }
  ]
}
```

---

## 5. Ingestão de Leituras Periódicas

### `POST /api/v1/leituras`
Registra uma leitura manual (semanal/diária) inserida pelo gestor predial.

**Requisição:**
```json
{
  "data": "2026-08-20",
  "valorPago": 187.0,
  "volumeM3": 18.7, // opcional se valorPago for fornecido
  "unidadeId": "und-302" // opcional (omita para hidrômetro principal)
}
```

**Resposta (201 Created):**
```json
{
  "ok": true,
  "id": "lei-109283"
}
```

---

## 6. Unidades / Apartamentos

### `GET /api/v1/unidades`
Lista todas as unidades cadastradas no condomínio.

### `POST /api/v1/unidades`
Cadastra uma nova unidade.

**Requisição:**
```json
{
  "nome": "Apto 403",
  "ocupantesEstimados": 3,
  "areaM2": 68.0
}
```

### `DELETE /api/v1/unidades/{id}`
Remove a unidade especificada.

---

## 7. Alertas e Histórico

### `GET /api/v1/alertas`
Lista todos os alertas e diagnósticos gerados pelo algoritmo de detecção de anomalias (Baseline + 2σ e vazão noturna).

### `PATCH /api/v1/alertas/{id}/lido`
Marca o alerta como verificado ou resolvido.

### `GET /api/v1/historico`
Retorna a série temporal dos meses anteriores com as decomposições históricas.
