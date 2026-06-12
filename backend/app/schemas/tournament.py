from pydantic import BaseModel, Field, field_validator


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
