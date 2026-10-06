import { Requirements, Requirement } from './PasswordRequirements.styles'


type PasswordRequirementsProps = {
    password: string
}

function PasswordRequirements( { password }: PasswordRequirementsProps){
    const missingRequirements: string[] = []

    if(!/[a-z]/.test(password)){missingRequirements.push('1 lowercase')}

    if(!/[A-Z]/.test(password)){missingRequirements.push('1 uppercase')}

    if(!/[0-9]/.test(password)){missingRequirements.push('1 number')}

    if(!/[^A-Za-z0-9\s]/.test(password)){missingRequirements.push('1 special character')}

    if(password.length < 8 ){missingRequirements.push('at least 8 characters')}

    return (
        <Requirements id="password-help">
            {missingRequirements.length > 0 && (
                <Requirement $valid={false}>
                    Password requirements: {missingRequirements.join(' . ')}
                </Requirement>
            )}

        </Requirements>
    )
}
export default PasswordRequirements