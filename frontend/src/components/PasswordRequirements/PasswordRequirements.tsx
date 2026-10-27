import { Requirements, Requirement } from './PasswordRequirements.styles'
import { validatePassword } from '../../services/passwordValidation'

type PasswordRequirementsProps = {
    password: string
}

function PasswordRequirements({ password }: PasswordRequirementsProps) {
    const { missingRequirements } = validatePassword(password)

    return (
        <Requirements id="password-help">
            {missingRequirements.length > 0 && (
                <Requirement $valid={false}>
                    Password requirements: {missingRequirements.join(' · ')}
                </Requirement>
            )}
        </Requirements>
    )
}

export default PasswordRequirements