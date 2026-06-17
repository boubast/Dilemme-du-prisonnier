import re
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


def remove_script_line_breaks(script: str) -> str:
    return re.sub(r"\s*[\r\n]+\s*", " ", script).strip()


class StrategieBase(BaseModel):
    nom: str = Field(..., min_length=1, max_length=255)
    explication: str = Field(..., min_length=1)
    script_rhai: str = Field(..., min_length=1)

    @field_validator("script_rhai", mode="before")
    @classmethod
    def normalize_script_rhai(cls, script: Any) -> Any:
        if not isinstance(script, str):
            return script
        return remove_script_line_breaks(script)


class StrategieCreate(StrategieBase):
    pass


class StrategieUpdate(BaseModel):
    nom: str | None = Field(default=None, min_length=1, max_length=255)
    explication: str | None = Field(default=None, min_length=1)
    script_rhai: str | None = Field(default=None, min_length=1)

    @field_validator("script_rhai", mode="before")
    @classmethod
    def normalize_script_rhai(cls, script: Any) -> Any:
        if not isinstance(script, str):
            return script
        return remove_script_line_breaks(script)


class StrategieListRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_strategie: int
    nom: str
    explication: str


class StrategieDetailRead(StrategieBase):
    model_config = ConfigDict(from_attributes=True)

    id_strategie: int


class StrategieSyntaxValidationRequest(BaseModel):
    script_rhai: str = Field(..., min_length=1)


class StrategieSyntaxValidationRead(BaseModel):
    valid: bool
    error: str | None = None
