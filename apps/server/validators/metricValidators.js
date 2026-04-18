const METRIC_TYPES = ['Steps', 'Water', 'Sleep', 'Calories'];
const NOTES_MAX_LEN = 500;

const LIMITS = {
  Steps: { min: 1, max: 100000, integer: true },
  Water: { min: 0.1, max: 10, integer: false },
  Sleep: { min: 0.25, max: 24, integer: false },
  Calories: { min: 1, max: 10000, integer: true },
};

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

function validateMetricRequest(req, res, next) {
  const { id, dateISO, type, value, unit, notes, createdAt } = req.body;
  const errors = {};

  if (!id || !String(id).trim()) {
    errors.id = 'Metric id is required';
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
    errors.type = 'Metric type is required';
  } else if (!METRIC_TYPES.includes(trimmedType)) {
    errors.type = 'Please select a valid metric type';
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    errors.value = 'Value must be numeric';
  } else if (trimmedType && LIMITS[trimmedType]) {
    const { min, max, integer } = LIMITS[trimmedType];

    if (integer && !Number.isInteger(parsedValue)) {
      errors.value = 'Value must be a whole number';
    } else if (parsedValue < min || parsedValue > max) {
      errors.value = `Value must be between ${min} and ${max}`;
    }
  }

  if (!unit || !String(unit).trim()) {
    errors.unit = 'Unit is required';
  }

  const trimmedNotes = String(notes || '').trim();
  if (trimmedNotes.length > NOTES_MAX_LEN) {
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
  validateMetricRequest,
};