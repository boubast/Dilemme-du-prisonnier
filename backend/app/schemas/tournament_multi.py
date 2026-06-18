from datetime import date

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from app.schemas.strategie import StrategieDetailRead


class TournamentMultiLaunchCreate(BaseModel):
    strategie_ids: list[int] = Field(..., min_length=2)
    duree: int

    @field_validator("strategie_ids")
    @classmethod
    def validate_unique_strategies(cls, strategie_ids: list[int]) -> list[int]:
        if len(strategie_ids) != len(set(strategie_ids)):
            raise ValueError("A tournament cannot use the same strategy more than once")
        return strategie_ids


class ParticipationMultiRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_strategie: int
    strategie: StrategieDetailRead


class TournamentMultiDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_tournoi: int
    duree: int
    date_creation: date
    meilleure_strategie: str | None
    type_tournoi: Type_tournoi

    # Champs exclus
    participations: list[ParticipationMultiRead] = Field(exclude=True)

    @computed_field
    @property
    def nom(self) -> str:
        return f"Tournament #{self.id_tournoi}"

    @computed_field
    @property
    def strategies(self) -> list[StrategieDetailRead]:
        return [p.strategie for p in self.participations]
