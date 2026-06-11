from sqlalchemy import BigInteger, ForeignKey, Identity
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Partie(Base):
    __tablename__ = "partie"

    id_partie: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    id_strategie_1: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("strategie.id_strategie", ondelete="CASCADE"),
        nullable=False,
    )
    id_strategie_2: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("strategie.id_strategie", ondelete="CASCADE"),
        nullable=False,
    )
    id_tournoi: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("tournoi.id_tournoi", ondelete="CASCADE"),
        nullable=False,
    )

    strategie_1: Mapped["Strategie"] = relationship(
        "Strategie",
        foreign_keys=[id_strategie_1],
        back_populates="parties_comme_strategie_1",
    )
    strategie_2: Mapped["Strategie"] = relationship(
        "Strategie",
        foreign_keys=[id_strategie_2],
        back_populates="parties_comme_strategie_2",
    )
    tournoi: Mapped["Tournoi"] = relationship("Tournoi", back_populates="parties")
    iterations: Mapped[list["Iteration"]] = relationship(
        "Iteration",
        back_populates="partie",
        cascade="all, delete-orphan",
    )
