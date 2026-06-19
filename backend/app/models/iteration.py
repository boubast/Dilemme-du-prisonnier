from sqlalchemy import BigInteger, Boolean, ForeignKey, Identity, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Iteration(Base):
    __tablename__ = "iteration"

    id_iteration: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    id_partie: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("partie.id_partie", ondelete="CASCADE"),
        nullable=False,
    )
    numero_iteration: Mapped[int] = mapped_column(Integer, nullable=False)
    choix_strategie_1: Mapped[bool] = mapped_column(Boolean, nullable=False)
    choix_strategie_2: Mapped[bool] = mapped_column(Boolean, nullable=False)

    partie: Mapped["Partie"] = relationship("Partie", back_populates="iterations")
