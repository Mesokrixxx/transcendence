export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 100

export const PASSWORD_PATTERN = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\\s]).{8,100}'

export const PASSWORD_MESSAGE =
    'Use 8–100 characters, including an uppercase letter, a lowercase letter, a number and a special character.'

export function validatePassword(password: string) {
    const missingRequirements: string[] = []

    if (!/[a-z]/.test(password)) {
        missingRequirements.push('1 lowercase')
    }

    if (!/[A-Z]/.test(password)) {
        missingRequirements.push('1 uppercase')
    }

    if (!/[0-9]/.test(password)) {
        missingRequirements.push('1 number')
    }

    if (!/[^A-Za-z0-9\s]/.test(password)) {
        missingRequirements.push('1 special character')
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
        missingRequirements.push('at least 8 characters')
    }

    if (password.length > PASSWORD_MAX_LENGTH) {
        missingRequirements.push('no more than 100 characters')
    }

    return {
        isValid: missingRequirements.length === 0,
        missingRequirements,
    }
}