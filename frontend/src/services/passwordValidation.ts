export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;

export const PASSWORD_PATTERN =
  '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\\s]).{8,100}';

export type PasswordRequirementKey =
  | 'passwordRuleLowercase'
  | 'passwordRuleUppercase'
  | 'passwordRuleNumber'
  | 'passwordRuleSpecial'
  | 'passwordRuleMinLength'
  | 'passwordRuleMaxLength';

export function validatePassword(password: string) {
  const missingRequirements: PasswordRequirementKey[] = [];

  if (!/[a-z]/.test(password))
    missingRequirements.push('passwordRuleLowercase');
  if (!/[A-Z]/.test(password))
    missingRequirements.push('passwordRuleUppercase');
  if (!/[0-9]/.test(password)) missingRequirements.push('passwordRuleNumber');
  if (!/[^A-Za-z0-9\s]/.test(password))
    missingRequirements.push('passwordRuleSpecial');
  if (password.length < PASSWORD_MIN_LENGTH)
    missingRequirements.push('passwordRuleMinLength');
  if (password.length > PASSWORD_MAX_LENGTH)
    missingRequirements.push('passwordRuleMaxLength');

  return {
    isValid: missingRequirements.length === 0,
    missingRequirements,
  };
}
