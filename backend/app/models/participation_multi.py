from sqlalchemy import BigInteger, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ParticipationMulti(Base):
    __tablename__ = "participation_multi"

    id_tournoi: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("tournoi_multi.id_tournoi", ondelete="CASCADE"),
        primary_key=True,
    )
    id_strategie: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("strategie.id_strategie", ondelete="CASCADE"),
        primary_key=True,
    )

    tournoi: Mapped["TournamentMulti"] = relationship("TournamentMulti", back_populates="participations")
    strategie: Mapped["Strategie"] = relationship("Strategie", back_populates="participations_multi")

    nombre_trahisons : Mapped[int] = mapped_column(Integer, nullable=False)
    nombre_cooperations : Mapped[int] = mapped_column(Integer, nullable=False)
    score : Mapped[int] = mapped_column(Integer, nullable=False)