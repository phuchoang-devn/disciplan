const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export const formatBodyToSend = (body) => {
  return JSON.stringify(body, getCircularReplacer());
}

export const handleUpdatedData = (json, taskRepo, repetitionRepo) => {
  let repeRefClone = repetitionRepo.current;

  repeRefClone = handleChangedRepetition(json, repeRefClone);

  if (json.added_repetition !== null)
    repeRefClone.push(json.added_repetition);

  repetitionRepo.current = repeRefClone;

  taskRepo.current = handleRelevantTasks(json, taskRepo);
}

function handleChangedRepetition(json, repetitionList) {
  let isChangedRepeNotNull = json.changed_repetition !== null;

  let newRepetitionList = removeOldRepetition(json, repetitionList, isChangedRepeNotNull);

  if (isChangedRepeNotNull)
    newRepetitionList.push(json.changed_repetition);

  return newRepetitionList;
}

function removeOldRepetition(json, repetitionList, isChangedRepeNotNull) {
  return repetitionList.filter(repe =>
    (repe.id !== json.deleted_repetition)
    && !(isChangedRepeNotNull && (repe.id === json.changed_repetition.id))
  );
}

function handleRelevantTasks(json, taskRepo) {
  let listChangedTaskIds = json.changed_tasks.map(task => task.id);

  // remove old and add new tasks
  return taskRepo.current.filter(task =>
    !(!!json.deleted_repetition && (task.repetition_group === json.deleted_repetition))
    && !json.deleted_tasks.includes(task.id)
    && !listChangedTaskIds.includes(task.id)
  )
    .concat(json.changed_tasks)
    .concat(json.added_tasks);
}

export const handleAddedData = (json, taskRepo, repetitionRepo) => {
  let repeRefClone = repetitionRepo.current;
  if (json.repetition !== null)
    repeRefClone.push(json.repetition);
  repetitionRepo.current = repeRefClone;

  taskRepo.current = json.tasks.concat(taskRepo.current);
}