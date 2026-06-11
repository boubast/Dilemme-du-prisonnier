from sqlalchemy import BigInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Participation(Base):
    __tablename__ = "participation"

    id_tournoi: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("tournoi.id_tournoi", ondelete="CASCADE"),
        primary_key=True,
    )
    id_strategie: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("strategie.id_strategie", ondelete="CASCADE"),
        primary_key=True,
    )

    tournoi: Mapped["Tournoi"] = relationship("Tournoi", back_populates="participations")
    strategie: Mapped["Strategie"] = relationship("Strategie", back_populates="participations")
