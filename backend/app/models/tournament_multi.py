from sqlalchemy import BigInteger, Date, Identity, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TournamentMulti(Base):
    __tablename__ = "tournoi_multi"

    id_tournoi: Mapped[int] = mapped_column(BigInteger, ForeignKey("strategie.id_strategie", ondelete="CASCADE"), primary_key=True)
    duree_secondes: Mapped[int] = mapped_column(Integer, nullable=False)

    participations: Mapped[list["ParticipationMulti"]] = relationship(
        "ParticipationMulti",
        back_populates="tournoi",
        cascade="all, delete-orphan",
    )