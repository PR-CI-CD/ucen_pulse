const ACTIVITY_TYPES = ['Running', 'Cycling', 'Gym', 'Swimming', 'Yoga', 'Walking', 'Other'];
const DURATION_MIN = 1;
const DURATION_MAX = 1440;
const NOTES_MAX_LEN = 500;

function isValidISODateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}

function isInFuture(isoDate) {
  const today = new Date();
  const endOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  );

  return new Date(isoDate).getTime() > endOfToday.getTime();
}

function validateActivityRequest(req, res, next) {
  const { id, dateISO, type, duration, notes, createdAt } = req.body;
  const errors = {};

  if (!id || !String(id).trim()) {
    errors.id = 'Activity id is required';
  }

  if (!dateISO) {
    errors.dateISO = 'Date is required';
  } else if (!isValidISODateString(dateISO)) {
    errors.dateISO = 'Date must be a valid ISO date (YYYY-MM-DD)';
  } else if (isInFuture(dateISO)) {
    errors.dateISO = 'Date cannot be in the future';
  }

  const trimmedType = String(type || '').trim();
  if (!trimmedType) {
    errors.type = 'Activity type is required';
  } else if (!ACTIVITY_TYPES.includes(trimmedType)) {
    errors.type = 'Please select a valid activity type';
  }

  const parsedDuration = Number(duration);
  if (!Number.isFinite(parsedDuration)) {
    errors.duration = 'Duration must be a number';
  } else if (!Number.isInteger(parsedDuration)) {
    errors.duration = 'Duration must be a whole number';
  } else if (parsedDuration < DURATION_MIN || parsedDuration > DURATION_MAX) {
    errors.duration = `Duration must be between ${DURATION_MIN} and ${DURATION_MAX} minutes`;
  }

  const trimmedNotes = String(notes || '').trim();
  if (trimmedType === 'Other' && trimmedNotes.length < 3) {
    errors.notes = "Please add a brief description for 'Other'";
  } else if (trimmedNotes.length > NOTES_MAX_LEN) {
    errors.notes = `Notes must be ${NOTES_MAX_LEN} characters or fewer`;
  }

  if (createdAt == null || !Number.isFinite(Number(createdAt))) {
    errors.createdAt = 'Created timestamp is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

module.exports = {
  validateActivityRequest,
};