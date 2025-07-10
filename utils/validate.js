import validator from 'validator';

export const validateSignupInput = ({ email, password }) => {
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push("Invalid or missing email.");
  }

  const isStrong = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!isStrong) {
    errors.push("Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
