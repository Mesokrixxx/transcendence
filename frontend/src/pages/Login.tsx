import type { SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Form from '../components/Form/Form'
import Input from '../components/Input/Input'
import Button from '../components/Button/Button'
import Footer from '../components/Footer/Footer'
import { Page } from './Home.styles'
import { AuthContent, AuthPanel, AuthHint } from './Auth.styles'

function Login(){
    function handleSubmit(event: SubmitEvent<HTMLFormElement>){
        event.preventDefault()
    }
    return(
        <Page>
            <Navbar />

            <AuthContent className="container">
                <AuthPanel>
                    <h1>Welcome Back!</h1>
                    <Form onSubmit={handleSubmit}>
                        <Input id="login-email" 
                        name="email" 
                        label="Email" 
                        type="email" 
                        placeholder="you@example.com"
                        autoComplete="email"
                        required/>

                        <Input id="login-password"
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="Your password"
                        autoComplete="current-password"
                        required/>

                        <Button type="submit">Log in</Button>
                    </Form>

                    <AuthHint>
                        No account yet ? <Link to="/register">Sign up</Link>
                    </AuthHint>
                </AuthPanel>
            </AuthContent>

            <Footer/>

        </Page>
    )
}

export default Login
