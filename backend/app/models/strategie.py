from sqlalchemy import BigInteger, Identity, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Strategie(Base):
    __tablename__ = "strategie"

    id_strategie: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    nom: Mapped[str] = mapped_column(String(255), nullable=False)
    explication: Mapped[str] = mapped_column(Text, nullable=False)
    script_rhai: Mapped[str] = mapped_column(Text, nullable=False)

    parties_comme_strategie_1: Mapped[list["Partie"]] = relationship(
        "Partie",
        foreign_keys="Partie.id_strategie_1",
        back_populates="strategie_1",
    )
    parties_comme_strategie_2: Mapped[list["Partie"]] = relationship(
        "Partie",
        foreign_keys="Partie.id_strategie_2",
        back_populates="strategie_2",
    )
    participations: Mapped[list["Participation"]] = relationship(
        "Participation",
        back_populates="strategie",
        cascade="all, delete-orphan",
    )
