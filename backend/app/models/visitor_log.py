from __future__ import annotations

from datetime import datetime
import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.visitor_request import VisitorRequest


class VisitorLog(BaseModel):
    __tablename__ = "visitor_logs"

    visitor_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("visitor_requests.id"),
        unique=True,
        nullable=False,
    )

    check_in_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    check_out_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    visitor_request: Mapped["VisitorRequest"] = relationship(
        back_populates="visitor_log",
    )
    