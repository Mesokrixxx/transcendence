import { useTranslation } from 'react-i18next';
import { Requirements, Requirement } from './PasswordRequirements.styles';
import {
  validatePassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../services/passwordValidation';

type PasswordRequirementsProps = {
  password: string;
};

function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const { t } = useTranslation();
  const { missingRequirements } = validatePassword(password);

  return (
    <Requirements id="password-help">
      {missingRequirements.length > 0 && (
        <Requirement $valid={false}>
          {t('auth:passwordRequirements')}{' '}
          {missingRequirements.map((requirement, index) => {
            const label =
              requirement === 'passwordRuleMinLength'
                ? t(`auth:${requirement}`, { count: PASSWORD_MIN_LENGTH })
                : requirement === 'passwordRuleMaxLength'
                  ? t(`auth:${requirement}`, { count: PASSWORD_MAX_LENGTH })
                  : t(`auth:${requirement}`);
            return (
              <span key={requirement}>
                {index > 0 ? ' · ' : ''}
                {label}
              </span>
            );
          })}
        </Requirement>
      )}
    </Requirements>
  );
}

export default PasswordRequirements;
