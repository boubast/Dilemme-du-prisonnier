from sqlalchemy import BigInteger, Text, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Strategie(Base):
    __tablename__ = "strategie"

    id_strategie: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    nom: Mapped[str] = mapped_column(String(255), nullable=False)
    explication: Mapped[str] = mapped_column(Text, nullable=False)
    script_rhai: Mapped[str] = mapped_column(Text, nullable=False)
