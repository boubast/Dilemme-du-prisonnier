from datetime import date
from app.models.types.type_tournoi import Type_tournoi

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from app.schemas.strategie import StrategieDetailRead

class TournamentLaunchCreate(BaseModel):
    strategie_ids: list[int] = Field(..., min_length=2)
    nb_iterations: int
    cout_coop_coop: int
    cout_coop_trahi: int
    cout_trahi_coop: int
    cout_trahi_trahi: int

    @field_validator("strategie_ids")
    @classmethod
    def validate_unique_strategies(cls, strategie_ids: list[int]) -> list[int]:
        if len(strategie_ids) != len(set(strategie_ids)):
            raise ValueError("Un tournoi ne peut pas utiliser plusieurs fois la meme strategie")
        return strategie_ids

class TournamentMultiLaunchCreate(BaseModel):
    strategie_ids: list[int] = Field(..., min_length=2)
    duree_secondes: int

    @field_validator("strategie_ids")
    @classmethod
    def validate_unique_strategies(cls, strategie_ids: list[int]) -> list[int]:
        if len(strategie_ids) != len(set(strategie_ids)):
            raise ValueError("Un tournoi ne peut pas utiliser plusieurs fois la meme strategie")
        return strategie_ids

class IterationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_iteration: int
    numero_iteration: int
    choix_strategie_1: bool
    choix_strategie_2: bool


class PartieRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_partie: int
    id_strategie_1: int
    id_strategie_2: int
    strategie_1: StrategieDetailRead
    strategie_2: StrategieDetailRead
    iterations: list[IterationRead]
    resultats: dict
    score_strategie_1: int
    score_strategie_2: int


class ParticipationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_strategie: int
    strategie: StrategieDetailRead

class ParticipationMultiRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_strategie: int
    strategie: StrategieDetailRead

    nb_cooperate: int
    nb_betray: int
    score: int


class CostsSchema(BaseModel):
    tentation: int
    recompense: int
    punition: int
    dupe: int


class TournamentListRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_tournoi: int
    date_creation: date
    meilleure_strategie: str | None
    type_tournoi: Type_tournoi | None

    @computed_field
    @property
    def nom(self) -> str:
        return f"Tournoi #{self.id_tournoi}"


class TournamentDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_tournoi: int
    nb_iterations: int | None
    date_creation: date
    meilleure_strategie: str | None
    parties: list[PartieRead] | None
    type_tournoi: Type_tournoi

    # Champs exclus
    cout_coop_coop: int | None = Field(exclude=True)
    cout_coop_trahi: int | None = Field(exclude=True)
    cout_trahi_coop: int | None = Field(exclude=True)
    cout_trahi_trahi: int | None = Field(exclude=True)
    duree_secondes: int | None = Field(exclude=True)
    participations: list[ParticipationRead] | None = Field(exclude=True)
    participations_multi: list[ParticipationRead] | None = Field(exclude=True)
    resultats:dict | None
    scores_totaux:dict | None

    @computed_field
    @property
    def nom(self) -> str:
        return f"Tournament #{self.id_tournoi}"

    @computed_field
    @property
    def couts(self) -> CostsSchema | None:
        try:
            return CostsSchema(
                recompense=self.cout_coop_coop,
                dupe=self.cout_coop_trahi,
                tentation=self.cout_trahi_coop,
                punition=self.cout_trahi_trahi,
            )
        except:
            return None

    @computed_field
    @property
    def strategies(self) -> list[StrategieDetailRead]:
        return [p.strategie for p in self.participations]
