from pydantic import BaseModel, ConfigDict, Field


class StrategieBase(BaseModel):
    nom: str = Field(..., min_length=1, max_length=255)
    explication: str = Field(..., min_length=1)
    script_rhai: str = Field(..., min_length=1)


class StrategieCreate(StrategieBase):
    pass


class StrategieUpdate(BaseModel):
    nom: str | None = Field(default=None, min_length=1, max_length=255)
    explication: str | None = Field(default=None, min_length=1)
    script_rhai: str | None = Field(default=None, min_length=1)


class StrategieListRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_strategie: int
    nom: str
    explication: str


class StrategieDetailRead(StrategieBase):
    model_config = ConfigDict(from_attributes=True)

    id_strategie: int
