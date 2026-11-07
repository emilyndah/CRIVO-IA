from typing import Optional, List
from pydantic import BaseModel

class LoginPayload(BaseModel):
    email: str
    senha: Optional[str] = None

class RegisterPayload(BaseModel):
    nome: str
    email: str
    senha: Optional[str] = None
    nomePredio: str
    tipoPredio: str = "condominio"

class UsuarioResponse(BaseModel):
    id: str
    nome: str
    email: str
    cargo: str

class PredioResponse(BaseModel):
    id: str
    nome: str
    tipo: str
    cidade: str
    estado: str
    quantidadeUnidades: int
    tarifaVigenteAgua: float
    criadoEm: str

class PredioUpdate(BaseModel):
    nome: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    quantidadeUnidades: Optional[int] = None
    tarifaVigenteAgua: Optional[float] = None

class UnidadeResponse(BaseModel):
    id: str
    nome: str
    ocupantesEstimados: int
    areaM2: Optional[float] = 65.0
    consumoUltimoMes: Optional[float] = None
    destaque: Optional[bool] = False

class UnidadeCreate(BaseModel):
    nome: str
    ocupantesEstimados: int = 2
    areaM2: Optional[float] = 65.0

class LeituraCreate(BaseModel):
    data: str
    valorPago: float
    volumeM3: Optional[float] = None
    unidadeId: Optional[str] = None
    observacoes: Optional[str] = None

class LeituraResponse(BaseModel):
    ok: bool
    id: str

class UnidadeParecida(BaseModel):
    nome: str
    valorPago: float
    destaque: bool = False
    nota: Optional[str] = None

class AlertaItem(BaseModel):
    id: str
    titulo: str
    descricao: str
    tipo: str
    criadoEm: str
    unidade: Optional[str] = None
    status: str = "pendente"
    impactoEstimado: Optional[str] = None

class ResultadoResponse(BaseModel):
    mes: str
    valorPago: float
    esperado: float
    reajusteTarifa: float
    usoAcimaDoEsperado: float
    mesesSeguidosAlta: int
    mensagem: str
    tomMensagem: str
    unidadesParecidas: List[UnidadeParecida]
    alertasDesteMes: List[AlertaItem]

class HistoricoItem(BaseModel):
    mes: str
    valorPago: float
    esperado: float
    reajusteTarifa: float
    usoAcima: float
    variacaoMesAnteriorPct: Optional[float] = None
    alertaAtivo: Optional[bool] = False
