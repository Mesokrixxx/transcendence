import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useNavigate} from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar/Navbar'
import Form from '../../components/Form/Form'
import Input from '../../components/Input/Input'
import Button from '../../components/Button/Button'
import Footer from '../../components/Footer/Footer'
import fetchAPI from '../../services/fetchAPI'
import type { AuthUser} from '../../types/auth'
import { Page } from '../Home/Home.styles'
import { AuthContent, AuthPanel, AuthHint } from './Auth.styles'

function Login(){
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const { setUser }= useAuth()
    const navigate = useNavigate()

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        if (isLoading)
            return

        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')

        setError('')
        
        if (
            typeof email !== 'string' || typeof password !== 'string'
        ){
            setError('Please enter your email and password.')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetchAPI<AuthUser>({
                path: '/auth/login',
                method: 'post',
                body: {
                    email: email.trim(),
                    password
                }
            })

            if(response.error == true){
                if (typeof response.result === 'string'){
                    setError(response.result)
                }
                else{
                    setError(response.result.error)
                }

                return
            }
            setUser(response.result)
            navigate('/Profile', { replace: true })
        }
        finally{
            setIsLoading(false)
        }
    }
    return(
        <Page>
            <Navbar />

            <AuthContent className="container">
                <AuthPanel>
                    <h1>Welcome Back!</h1>
                    <Form onSubmit={handleSubmit}>
                        <Input 
                        id="login-email" 
                        name="email" 
                        label="Email" 
                        type="email" 
                        placeholder="you@example.com"
                        autoComplete="email"
                        required/>

                        <Input 
                        id="login-password"
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="Your password"
                        autoComplete="current-password"
                        required/>

                        <Button type="submit">Log in</Button>

                        {isLoading && (
                            <p role="status">logging in ...</p>
                        )}

                        {error &&(
                            <p role="alert">{error}</p>
                        )}

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
