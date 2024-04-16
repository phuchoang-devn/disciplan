from datetime import date, timedelta
from dateutil import relativedelta

from api.configs.default import FrequencyUnit
from api.configs.enviroment import get_default_values
from api.schemas.repetition_schemas import RepetitionIn

default_value = get_default_values()


def find_dates_with_normal_repetition(start: date, limit: date, frequency: int, frequency_unit: FrequencyUnit):
    time_delta = frequency * timedelta(days=1)
    if frequency_unit == FrequencyUnit.WEEK:
        time_delta = frequency * timedelta(weeks=1)
    elif frequency_unit == FrequencyUnit.MONTH:
        time_delta = frequency * relativedelta.relativedelta(months=1)
    elif frequency_unit == FrequencyUnit.YEAR:
        time_delta = frequency * relativedelta.relativedelta(years=1)

    list_of_dates = []
    while (start := start + time_delta) <= limit:
        list_of_dates.append(start)

    return list_of_dates


def find_same_order_weekdays_in_month(start: date, limit: date, frequency: int):
    relative_time_delta = frequency * relativedelta.relativedelta(months=1)

    weekday_of_start = start.weekday()
    order_of_week = int(start.day / 7)
    d = start.replace(day=1 + 7 * order_of_week)

    list_of_dates = []
    while True:
        d = d + relative_time_delta
        offset = (weekday_of_start - d.weekday() + 7) % 7
        if (start := d + timedelta(days=offset)) <= limit:
            list_of_dates.append(start)
        else:
            break

    return list_of_dates


def find_last_weekdays_in_month(start: date, limit: date, frequency: int):
    relative_time_delta = frequency * relativedelta.relativedelta(months=1)

    weekday_of_start = start.weekday()
    last_day_of_month = start.replace(day=1) + relativedelta.relativedelta(months=1) - timedelta(days=1)

    list_of_dates = []
    while True:
        last_day_of_month = last_day_of_month + relative_time_delta
        offset = (last_day_of_month.weekday() - weekday_of_start + 7) % 7
        if (start := last_day_of_month - timedelta(days=offset)) <= limit:
            list_of_dates.append(start)
        else:
            break

    return list_of_dates


def calcu_repeated_date(date_start: date, repetition_in: RepetitionIn):
    defined_limit = date.today() + timedelta(days=default_value.REPETITION_LIMIT)
    if not repetition_in.repetition_end or (repetition_in.repetition_end > defined_limit):
        limit_date = defined_limit
    else:
        limit_date = repetition_in.repetition_end

    match repetition_in.frequency_unit:
        case FrequencyUnit.ORDER_OF_WEEK:
            list_dates = find_same_order_weekdays_in_month(date_start,
                                                                limit_date,
                                                                repetition_in.frequency)
        case FrequencyUnit.LAST_WEEK_MONTH:
            list_dates = find_last_weekdays_in_month(date_start,
                                                          limit_date,
                                                          repetition_in.frequency)
        case _:
            list_dates = find_dates_with_normal_repetition(date_start,
                                                                limit_date,
                                                                repetition_in.frequency,
                                                                repetition_in.frequency_unit)
    return list_dates
