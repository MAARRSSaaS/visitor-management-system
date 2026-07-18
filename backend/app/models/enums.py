import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EMPLOYEE = "employee"


class VisitorRequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"