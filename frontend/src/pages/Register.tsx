import type { SubmitEvent } from 'react'
import fetchAPI from '../services/fetchAPI'
import type { AuthUser } from '../types/auth'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Form from '../components/Form/Form'
import Input from '../components/Input/Input'
import Button from '../components/Button/Button'
import PasswordRequirements from '../components/PasswordRequirements/PasswordRequirements'
import Footer from '../components/Footer/Footer'
import { Page } from './Home/Home.styles'
import { AuthContent, AuthPanel, AuthHint, AuthSuccess} from './Login/Auth.styles'
import {validatePassword, PASSWORD_PATTERN, PASSWORD_MESSAGE, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH,} from '../services/passwordValidation'

function Register(){
    const [password, setPassord] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const[success, setSuccess] = useState('')


    async function handleSubmit(event: SubmitEvent<HTMLFormElement>){
        event.preventDefault()
        
        if (isLoading)
            return

        setError('')
        setSuccess('')

        const form = event.currentTarget
        const data = new FormData(form)

        const username = String(data.get('username')?? '').trim()
        const email = String(data.get('email')?? '').trim()
        const submittedPassword = String(data.get('password')?? '') 
        const confirmation = String(data.get('confirmPassword')?? '')

    const passwordInput = form.elements.namedItem(
        'password'
    ) as HTMLInputElement

    const confirmationInput = form.elements.namedItem(
        'confirmPassword'
    ) as HTMLInputElement

    passwordInput.setCustomValidity('')
    confirmationInput.setCustomValidity('')

    const validation = validatePassword(submittedPassword)

    if (!validation.isValid) {
    passwordInput.setCustomValidity(PASSWORD_MESSAGE)
}

    if (submittedPassword !== confirmation){
        confirmationInput.setCustomValidity('Passwords do not match.')
    }

    if (!form.reportValidity()) {
        return
    }

    if (username === ''){
        setError('Please enter a username.')
        return
    }

    setIsLoading(true)

    try {
        const response = await fetchAPI<AuthUser>({
            path: '/users',
            method: 'post',
            body: {
                username,
                email,
                password: submittedPassword
            }
    })

    if (response.error === true) {
            let message

            if (typeof response.result === 'string') {
                message = response.result
            } else {
                message = response.result.error
            }

            if (message === 'username already exists') {
                setError('This username is already in use.')
            } else if (message === 'email already exists') {
                setError('This email is already in use.')
            } else if (message === 'value(s) already exists') {
                setError('This username or email is already in use.')
            } else {
                setError(message)
            }
            return
        }
        setSuccess('Account created. You can now log in. ')
        form.reset()
        setPassord('')
    }
    finally
    {
        setIsLoading(false)
    }

    }

    return(
        <Page>
            <Navbar/>

            <AuthContent className="container">
                <AuthPanel>
                    <h1>Create your account</h1>

                    {success && (
                        <AuthSuccess role="status">
                            <h2>Account created!</h2>
                            <p>You can now log in and start playing.</p>
                            <Button to="/login">Log in</Button>
                        </AuthSuccess>
                    )}

                    {!success && (
                        <Form onSubmit={handleSubmit}>
                        <Input
                            id="register-username"
                            name="username"
                            label="Username"
                            type="text"
                            autoComplete="username"
                            placeholder="Your username"
                            maxLength={32}
                            required
                        />

                        <Input
                            id="register-email"
                            name="email"
                            label="Email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            required
                        />

                        <Input
                            id="register-password"
                            name="password"
                            label="Password"
                            type="password"
                            autoComplete="new-password"
                            aria-describedby="password-help"
                            placeholder="Example42$"
                            pattern={PASSWORD_PATTERN}
                            title={PASSWORD_MESSAGE}
                            value={password}
                            onChange={(event) =>{
                                event.currentTarget.setCustomValidity('')
                                setPassord(event.currentTarget.value)}}
                            minLength={PASSWORD_MIN_LENGTH}
                            maxLength={PASSWORD_MAX_LENGTH}
                            required
                        />
                        <PasswordRequirements password={password} />

                        <Input
                            id="register-confirm-password"
                            name="confirmPassword"
                            label="Confirm password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                            onChange={(event)=>{event.currentTarget.setCustomValidity('') }}
                            required
                        />

                        <Button type="submit">Create account</Button>

                        {isLoading && (
                            <p role="status">Creating account...</p>
                        )}

                        {error && (
                            <p role="alert">{error}</p>
                        )}

                    </Form>
                    )}
                    
                    {!success && (
                         <AuthHint>
                            Already have an account? <Link to="/login">Log in</Link>
                        </AuthHint>
                    )}

                </AuthPanel>
            </AuthContent>
            <Footer/>
        </Page>
    )
}

export default Register