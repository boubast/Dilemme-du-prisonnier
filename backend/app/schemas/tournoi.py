from datetime import date
from pydantic import BaseModel, ConfigDict, Field, computed_field
from app.schemas.strategie import StrategieDetailRead

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


class ParticipationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_strategie: int
    strategie: StrategieDetailRead


class CoutsSchema(BaseModel):
    tentation: int
    recompense: int
    punition: int
    dupe: int


class TournoiListRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_tournoi: int
    date_creation: date
    meilleure_strategie: str | None

    @computed_field
    @property
    def nom(self) -> str:
        return f"Tournoi #{self.id_tournoi}"


class TournoiDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_tournoi: int
    nb_iterations: int
    date_creation: date
    meilleure_strategie: str | None
    parties: list[PartieRead]

    # Champs exclus
    cout_coop_coop: int = Field(exclude=True)
    cout_coop_trahi: int = Field(exclude=True)
    cout_trahi_coop: int = Field(exclude=True)
    cout_trahi_trahi: int = Field(exclude=True)
    participations: list[ParticipationRead] = Field(exclude=True)

    @computed_field
    @property
    def nom(self) -> str:
        return f"Tournoi #{self.id_tournoi}"

    @computed_field
    @property
    def couts(self) -> CoutsSchema:
        return CoutsSchema(
            recompense=self.cout_coop_coop,
            dupe=self.cout_coop_trahi,
            tentation=self.cout_trahi_coop,
            punition=self.cout_trahi_trahi,
        )

    @computed_field
    @property
    def strategies(self) -> list[StrategieDetailRead]:
        return [p.strategie for p in self.participations]
