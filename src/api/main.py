"""API FastAPI do Crivo — integração do Frontend com o Motor de Machine Learning."""
from typing import Optional
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware

from src.api.schemas.modelos import (
    AlertaItem,
    HistoricoItem,
    LeituraCreate,
    LeituraResponse,
    LoginPayload,
    PredioResponse,
    PredioUpdate,
    RegisterPayload,
    ResultadoResponse,
    UnidadeCreate,
    UnidadeResponse,
    UsuarioResponse,
)
from src.models.treino import ARQUIVO_MODELO
from src.services.alertas import calcular_sigma

app = FastAPI(
    title="Crivo IA — API de Inteligência Hídrica",
    description="API de monitoramento preditivo, decomposição tarifária e detecção de anomalias por Machine Learning.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Estado em Memória ──────────────────────────────────────────────────────
USUARIO_ATUAL = {
    "id": "usr-1",
    "nome": "Samuel Faleiro",
    "email": "samuel@crivo.ia",
    "cargo": "Síndico / Gestor Predial",
}

PREDIO_ATUAL = {
    "id": "prd-1",
    "nome": "Condomínio Exemplo",
    "tipo": "condominio",
    "cidade": "Anápolis",
    "estado": "GO",
    "quantidadeUnidades": 64,
    "tarifaVigenteAgua": 10.0,
    "criadoEm": "2026-06-01T08:00:00Z",
}

UNIDADES = [
    {"id": "und-101", "nome": "Apto 101", "ocupantesEstimados": 2, "areaM2": 65.0, "consumoUltimoMes": 160.0, "destaque": False},
    {"id": "und-202", "nome": "Apto 202", "ocupantesEstimados": 3, "areaM2": 65.0, "consumoUltimoMes": 171.0, "destaque": False},
    {"id": "und-302", "nome": "Apto 302", "ocupantesEstimados": 3, "areaM2": 68.0, "consumoUltimoMes": 187.0, "destaque": True},
]

ALERTAS = [
    {
        "id": "alt-1",
        "titulo": "Uso alto 3 meses seguidos",
        "descricao": "Água, desde junho. Possível vazamento.",
        "tipo": "alta",
        "criadoEm": "2026-08-25T10:00:00Z",
        "status": "pendente",
        "impactoEstimado": "R$ 14,00 / mês",
    },
    {
        "id": "alt-2",
        "titulo": "Reajuste de tarifa aplicado",
        "descricao": "Já considerado no cálculo deste mês.",
        "tipo": "tarifa",
        "criadoEm": "2026-08-01T00:00:00Z",
        "status": "pendente",
    },
]

HISTORICO = [
    {"mes": "2026-03", "valorPago": 160.0, "esperado": 160.0, "reajusteTarifa": 0.0, "usoAcima": 0.0, "variacaoMesAnteriorPct": 0.0, "alertaAtivo": False},
    {"mes": "2026-04", "valorPago": 162.0, "esperado": 162.0, "reajusteTarifa": 0.0, "usoAcima": 0.0, "variacaoMesAnteriorPct": 1.2, "alertaAtivo": False},
    {"mes": "2026-05", "valorPago": 164.0, "esperado": 163.0, "reajusteTarifa": 0.0, "usoAcima": 1.0, "variacaoMesAnteriorPct": 1.2, "alertaAtivo": False},
    {"mes": "2026-06", "valorPago": 173.0, "esperado": 164.0, "reajusteTarifa": 0.0, "usoAcima": 9.0, "variacaoMesAnteriorPct": 5.5, "alertaAtivo": True},
    {"mes": "2026-07", "valorPago": 178.0, "esperado": 165.0, "reajusteTarifa": 0.0, "usoAcima": 13.0, "variacaoMesAnteriorPct": 2.9, "alertaAtivo": True},
    {"mes": "2026-08", "valorPago": 187.0, "esperado": 165.0, "reajusteTarifa": 8.0, "usoAcima": 14.0, "variacaoMesAnteriorPct": 5.1, "alertaAtivo": True},
]

LEITURAS = []


# ── Rotas de Autenticação ──────────────────────────────────────────────────
@app.get("/api/v1/auth/me", response_model=UsuarioResponse)
def get_me(session_id: Optional[str] = Cookie(default="sess-default")):
    if not session_id:
        raise HTTPException(status_code=401, detail="Não autenticado")
    return USUARIO_ATUAL


@app.post("/api/v1/auth/login", response_model=UsuarioResponse)
def login(payload: LoginPayload, response: Response):
    USUARIO_ATUAL["email"] = payload.email
    response.set_cookie(key="session_id", value="sess-crivo-ok", httponly=True, samesite="lax")
    return USUARIO_ATUAL


@app.post("/api/v1/auth/register", status_code=201, response_model=UsuarioResponse)
def register(payload: RegisterPayload, response: Response):
    USUARIO_ATUAL["nome"] = payload.nome
    USUARIO_ATUAL["email"] = payload.email
    PREDIO_ATUAL["nome"] = payload.nomePredio
    PREDIO_ATUAL["tipo"] = payload.tipoPredio
    response.set_cookie(key="session_id", value="sess-crivo-ok", httponly=True, samesite="lax")
    return USUARIO_ATUAL


@app.post("/api/v1/auth/logout")
def logout(response: Response):
    response.delete_cookie("session_id")
    return {"ok": True}


# ── Rotas de Prédio ────────────────────────────────────────────────────────
@app.get("/api/v1/predio", response_model=PredioResponse)
def get_predio():
    return PREDIO_ATUAL


@app.patch("/api/v1/predio", response_model=PredioResponse)
def update_predio(payload: PredioUpdate):
    dados = payload.model_dump(exclude_unset=True)
    PREDIO_ATUAL.update(dados)
    return PREDIO_ATUAL


# ── Rotas de Resultado e Diagnóstico ──────────────────────────────────────
@app.get("/api/v1/resultado/{mes}", response_model=ResultadoResponse)
def get_resultado_mes(mes: str):
    item = next((h for h in HISTORICO if h["mes"] == mes), HISTORICO[-1])
    diferenca = item["valorPago"] - item["esperado"]
    if diferenca > 0:
        msg = (
            f"Sua conta subiu R$ {diferenca:.0f}. "
            f"R$ {item['reajusteTarifa']:.0f} foi tarifa, "
            f"R$ {item['usoAcima']:.0f} foi uso. "
            "É o 3º mês seguido de alta, vale checar vazamento."
        )
        tom = "alerta"
    else:
        msg = "Consumo dentro do esperado para o perfil do condomínio."
        tom = "ok"

    return {
        "mes": item["mes"],
        "valorPago": item["valorPago"],
        "esperado": item["esperado"],
        "reajusteTarifa": item["reajusteTarifa"],
        "usoAcimaDoEsperado": item["usoAcima"],
        "mesesSeguidosAlta": 3 if tom == "alerta" else 0,
        "mensagem": msg,
        "tomMensagem": tom,
        "unidadesParecidas": [
            {"nome": "Apto 101", "valorPago": 160.0},
            {"nome": "Apto 202", "valorPago": 171.0},
            {"nome": "Apto 302, acima das parecidas", "valorPago": 187.0, "destaque": True, "nota": "Dados de exemplo."},
        ],
        "alertasDesteMes": ALERTAS,
    }


# ── Rotas de Leituras ──────────────────────────────────────────────────────
@app.post("/api/v1/leituras", status_code=201, response_model=LeituraResponse)
def criar_leitura(payload: LeituraCreate):
    novo_id = f"lei-{len(LEITURAS) + 1001}"
    LEITURAS.append({"id": novo_id, **payload.model_dump()})
    if HISTORICO:
        ultimo = HISTORICO[-1]
        ultimo["valorPago"] = payload.valorPago
        excesso = max(0.0, payload.valorPago - ultimo["esperado"] - ultimo["reajusteTarifa"])
        ultimo["usoAcima"] = excesso
    return {"ok": True, "id": novo_id}


# ── Rotas de Unidades ──────────────────────────────────────────────────────
@app.get("/api/v1/unidades", response_model=list[UnidadeResponse])
def listar_unidades():
    return UNIDADES


@app.post("/api/v1/unidades", status_code=201, response_model=UnidadeResponse)
def criar_unidade(payload: UnidadeCreate):
    nova = {
        "id": f"und-{len(UNIDADES) + 101}",
        "nome": payload.nome,
        "ocupantesEstimados": payload.ocupantesEstimados,
        "areaM2": payload.areaM2,
        "consumoUltimoMes": round(payload.ocupantesEstimados * 54.0, 2),
        "destaque": False,
    }
    UNIDADES.append(nova)
    return nova


@app.delete("/api/v1/unidades/{unidade_id}")
def remover_unidade(unidade_id: str):
    global UNIDADES
    UNIDADES = [u for u in UNIDADES if u["id"] != unidade_id]
    return {"ok": True}


# ── Rotas de Alertas e Histórico ───────────────────────────────────────────
@app.get("/api/v1/alertas", response_model=list[AlertaItem])
def listar_alertas():
    return ALERTAS


@app.patch("/api/v1/alertas/{alerta_id}/lido")
def marcar_alerta_lido(alerta_id: str):
    for a in ALERTAS:
        if a["id"] == alerta_id:
            a["status"] = "resolvido"
            return a
    raise HTTPException(status_code=404, detail="Alerta não encontrado")


@app.get("/api/v1/historico", response_model=list[HistoricoItem])
def obter_historico():
    return HISTORICO


# ── Rota de Inferência de Machine Learning em Tempo Real ───────────────────
@app.get("/api/v1/ml/predicao")
def predizer_consumo_diario(fim_de_semana: int = 0, temperatura_c: float = 26.0, consumo_real_litros: Optional[float] = None):
    """Executa o modelo treinado scikit-learn (modelo_consumo.joblib) para estimar o consumo esperado."""
    if not ARQUIVO_MODELO.exists():
        raise HTTPException(status_code=503, detail="Modelo de Machine Learning não encontrado.")
    pacote = joblib.load(ARQUIVO_MODELO)
    df_entrada = pd.DataFrame([{"fim_de_semana": fim_de_semana, "temperatura_c": temperatura_c}])
    previsto = float(pacote["modelo"].predict(df_entrada[pacote["features"]])[0])
    sigma = calcular_sigma()
    limite_anomalia = previsto + 2 * sigma

    anomalia = False
    if consumo_real_litros is not None:
        anomalia = consumo_real_litros > limite_anomalia

    return {
        "features": {"fim_de_semana": fim_de_semana, "temperatura_c": temperatura_c},
        "consumo_esperado_litros": round(previsto, 2),
        "limite_superior_2sigma_litros": round(limite_anomalia, 2),
        "sigma_litros": round(sigma, 2),
        "consumo_real_litros": consumo_real_litros,
        "anomalia_detectada": anomalia,
    }
