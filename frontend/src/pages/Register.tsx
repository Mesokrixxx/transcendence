import type { SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Form from '../components/Form/Form'
import Input from '../components/Input/Input'
import Button from '../components/Button/Button'
import PasswordRequirements from '../components/PasswordRequirements/PasswordRequirements'
import Footer from '../components/Footer/Footer'
import { Page } from './Home/Home.styles'
import { AuthContent, AuthPanel, AuthHint} from './Login/Auth.styles'
import {validatePassword, PASSWORD_PATTERN, PASSWORD_MESSAGE, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH,} from '../services/passwordValidation'

function Register(){
    const [password, setPassord] = useState('')
    function handleSubmit(event: SubmitEvent<HTMLFormElement>){
        event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)

    const password = String(data.get('password')?? '') 
    const confirmation = String(data.get('confirmPassword')?? '')

    const passwordInput = form.elements.namedItem(
        'password'
    ) as HTMLInputElement

    const confirmationInput = form.elements.namedItem(
        'confirmPassword'
    ) as HTMLInputElement

    passwordInput.setCustomValidity('')
    confirmationInput.setCustomValidity('')

    const validation = validatePassword(password)

    if (!validation.isValid) {
    passwordInput.setCustomValidity(PASSWORD_MESSAGE)
}

    if (password !== confirmation){
        confirmationInput.setCustomValidity('Passwords do not match.')
    }

    if (!form.reportValidity()) {
        return
    }

    //back

    }

    return(
        <Page>
            <Navbar/>

            <AuthContent className="container">
                <AuthPanel>
                    <h1>Create your account</h1>

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
                    </Form>

                    <AuthHint>
                        Already have an account? <Link to="/login">Log in</Link>
                    </AuthHint>
                </AuthPanel>
            </AuthContent>
            <Footer/>
        </Page>
    )
}

export default Register