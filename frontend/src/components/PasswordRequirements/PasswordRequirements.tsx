import { Requirements, Requirement } from './PasswordRequirements.styles'


type PasswordRequirementsProps = {
    password: string
}

function PasswordRequirements({ password }: PasswordRequirementsProps){
    const validLength = password.length >= 8 && password.length <= 100
    const hasLetter = /[A-Za-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialCharacter = /[^A-Za-z0-9\s]/.test(password)

    return (
        <Requirements id="password-help">
            <Requirement $valid={validLength}>
                {validLength ? '✓' : '○' } Between 8 and 100 characters
            </Requirement>

            <Requirement $valid={hasLetter}>
                {hasLetter ? '✓' : '○' } At least one letter (A-Z)
            </Requirement>

            <Requirement $valid={hasNumber}>
                {hasNumber ? '✓' : '○' } At least one number
            </Requirement>
            
            <Requirement $valid={hasSpecialCharacter}>
                {hasSpecialCharacter ? '✓' : '○' } At least one special character
            </Requirement>

        </Requirements>
    )

}

export default PasswordRequirements

