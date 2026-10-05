import type { SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Form from '../components/Form/Form'
import Input from '../components/Input/Input'
import Button from '../components/Button/Button'
import Footer from '../components/Footer/Footer'
import { Page } from './Home.styles'
import { AuthContent, AuthPanel, AuthHint, PasswordHelp} from './Auth.styles'

function Register(){
    function handleSubmit(event: SubmitEvent<HTMLFormElement>){
        event.preventDefault()
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
                            minLength={8}
                            maxLength={100}
                            required
                        />

                        <Input
                            id="register-confirm-password"
                            name="confirmPassword"
                            label="Confirm assword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Example42$"
                            required
                        />

                        <PasswordHelp id="password-help">
                            At least * characters, including a letter, a number and a special character.
                        </PasswordHelp>

                        <Button type="submit">Create account</Button>
                    </Form>

                    <AuthHint>
                        Already have an acount? <Link to="/login">Log in</Link>
                    </AuthHint>
                </AuthPanel>
            </AuthContent>
            <Footer/>
        </Page>
    )
}

export default Register