from datetime import date

from sqlalchemy import BigInteger, Date, Identity, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Tournoi(Base):
    __tablename__ = "tournoi"

    id_tournoi: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    nb_iterations: Mapped[int] = mapped_column(Integer, nullable=False)
    cout_coop_coop: Mapped[int] = mapped_column(Integer, nullable=False)
    cout_coop_trahi: Mapped[int] = mapped_column(Integer, nullable=False)
    cout_trahi_coop: Mapped[int] = mapped_column(Integer, nullable=False)
    cout_trahi_trahi: Mapped[int] = mapped_column(Integer, nullable=False)
    date_creation: Mapped[date] = mapped_column(Date, nullable=False)
    meilleure_strategie: Mapped[str | None] = mapped_column(String(255))

    parties: Mapped[list["Partie"]] = relationship(
        "Partie",
        back_populates="tournoi",
        cascade="all, delete-orphan",
    )
    participations: Mapped[list["Participation"]] = relationship(
        "Participation",
        back_populates="tournoi",
        cascade="all, delete-orphan",
    )
