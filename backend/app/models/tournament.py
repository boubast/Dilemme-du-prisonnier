from datetime import date

from sqlalchemy import BigInteger, Date, Identity, Integer, String
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

class Tournament(Base):
    __tablename__ = "tournoi"

    id_tournoi: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    date_creation: Mapped[date] = mapped_column(Date, nullable=False)
    meilleure_strategie: Mapped[str | None] = mapped_column(String(255))

    type_tournoi: Mapped[pgEnum] = mapped_column(Type_tournoiPG,nullable=False)
