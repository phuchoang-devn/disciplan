from enum import Enum
from .enviroment import get_default_values


dv = get_default_values()


class Priority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ColorForPriority(str, Enum):
    CRITICAL = dv.CRITICAL_PRIORITY_COLOR
    HIGH = dv.HIGH_PRIORITY_COLOR
    MEDIUM = dv.MEDIUM_PRIORITY_COLOR
    LOW = dv.LOW_PRIORITY_COLOR

    @classmethod
    def dict(cls):
        return dict(map(lambda c: (c.name, c.value), cls))


class FrequencyUnit(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"
    """
     - ORDER_OF_WEEK: first/ second/ third/ forth + Monday/ Tuesday/...
     - LAST_WEEK_MONTH: last + Monday/ Tuesday/...
     """
    ORDER_OF_WEEK = "order_of_week"
    LAST_WEEK_MONTH = "last_week_month"


class UpdateType(str, Enum):
    ONLY_ONE_TASK = "only"
    ALL_TASKS_WITH_REPETITION = "all"
    ALL_TASKS_FROM_ONE_TASK = "from"
