from sqlalchemy import BigInteger, Date, Identity, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TournamentClassic(Base):
    __tablename__ = "tournoi_classique"

    id_tournoi: Mapped[int] = mapped_column(BigInteger, ForeignKey("strategie.id_strategie", ondelete="CASCADE"), primary_key=True)
    nb_iterations: Mapped[int] = mapped_column(Integer, nullable=False)
    cout_coop_coop: Mapped[int] = mapped_column(Integer, nullable=False)
    cout_coop_trahi: Mapped[int] = mapped_column(Integer, nullable=False)
    cout_trahi_coop: Mapped[int] = mapped_column(Integer, nullable=False)
    cout_trahi_trahi: Mapped[int] = mapped_column(Integer, nullable=False)

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
