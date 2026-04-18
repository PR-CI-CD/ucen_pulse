function validateRegisterRequest(req, res, next) {
  const { fullName, email, password } = req.body;
  const errors = {};

  if (!fullName || !String(fullName).trim()) {
    errors.fullName = 'Full name is required';
  }

  const trimmedEmail = String(email || '').trim();

  if (!trimmedEmail) {
    errors.email = 'Email is required';
  } else if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (String(password).length < 6) {
    errors.password = 'Password must be at least 6 characters long';
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

function validateLoginRequest(req, res, next) {
  const { email, password } = req.body;
  const errors = {};

  const trimmedEmail = String(email || '').trim();

  if (!trimmedEmail) {
    errors.email = 'Email is required';
  } else if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
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
  validateRegisterRequest,
  validateLoginRequest,
};