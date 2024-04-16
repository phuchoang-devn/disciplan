export const UpdateType = Object.freeze({
  ONLY_ONE_TASK: 'only',
  FROM_ONE_TASK: 'from',
  ALL_TASKS: 'all'
})

export const Priority = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical"
})

export const FormEditType = Object.freeze({
  UPDATE: "update",
  ADD: "add"
})

export const TimeUnitForNotification = Object.freeze({
  MINUTE: "minute",
  HOUR: "hours",
  DAY: "day",
  WEEK: "week",
})

export const TimeUnitForRepetition = Object.freeze({
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
})

export const SubFrequencyUnitForMonth = Object.freeze({
  MONTHLY: "monthly",
  ORDER_OF_WEEK: "order_of_week",
  LAST_WEEK_MONTH: "last_week_month"
})

export const AscendingList = Object.freeze({
  PRIORITY: Object.values(Priority),
  TIME_UNIT_FOR_NOTIFICATION: Object.values(TimeUnitForNotification),
  TIME_UNIT_FOR_REPETITION: Object.values(TimeUnitForRepetition)
})

export const UNDEFINED_ADDING_TASK = {
  isAdding: false,
  topInPixel: undefined,
  heightInPixel: undefined,
  timeStart: undefined,
  timeEnd: undefined,
  isLessThan15Min: true,
  isMouseDragingDown: undefined
}

export const UNDEFINED_MOVEDIN_TASK = {
  isMovedIn: false,
  taskInfo: undefined,
  topInPixel: undefined,
  heightInPercent: undefined
};

export const UNDEFINED_MOVING_TASK = {
  isMoving: false,
  dateStartOfTask: undefined,
  indexOfCurrentColumn: undefined,
  modifiedTaskToDisplay: undefined,
  topInPixel: undefined,
  heightInPercent: undefined
}