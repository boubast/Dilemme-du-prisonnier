from sqlalchemy import BigInteger, Identity, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import ENUM as pgEnum
from app.models.types.type_tournoi import Type_tournoi

from app.database import Base

Type_tournoiPG: pgEnum = pgEnum(
    Type_tournoi,
    name="type_tournoi",
    create_constraint=True,
    metadata=Base.metadata,
    validate_strings=True,
)

class Strategie(Base):
    __tablename__ = "strategie"

    id_strategie: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    nom: Mapped[str] = mapped_column(String(255), nullable=False)
    explication: Mapped[str] = mapped_column(Text, nullable=False)
    script_rhai: Mapped[str] = mapped_column(Text, nullable=False)
    type_strategie: Mapped[pgEnum] = mapped_column(Type_tournoiPG,nullable=False)

    parties_comme_strategie_1: Mapped[list["Partie"]] = relationship(
        "Partie",
        foreign_keys="Partie.id_strategie_1",
        back_populates="strategie_1",
        passive_deletes=True,
    )
    parties_comme_strategie_2: Mapped[list["Partie"]] = relationship(
        "Partie",
        foreign_keys="Partie.id_strategie_2",
        back_populates="strategie_2",
        passive_deletes=True,
    )
    participations: Mapped[list["Participation"]] = relationship(
        "Participation",
        back_populates="strategie",
        cascade="all, delete-orphan",
    )
    participations_multi: Mapped[list["ParticipationMulti"]] = relationship(
        "ParticipationMulti",
        back_populates="strategie",
        cascade="all, delete-orphan",
    )
