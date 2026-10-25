import { useState } from 'react'
import fetchAPI from '../services/fetchAPI'
import Button from '../components/Button/Button'

function ApiTest() {
    const [result, setResult] = useState('Test not started.')

    async function testAPI() {
        setResult('Loading...')

        const response = await fetchAPI({
            path: '/auth/login',
            method: 'post',
            body: {}
        })

        setResult(JSON.stringify(response, null, 2))
    }

    return (
        <main className="container">
            <h1>API test</h1>

            <Button onClick={testAPI}>
                Test invalid login
            </Button>

            <pre style={{ whiteSpace: 'pre-wrap', marginTop: 24 }}>
                {result}
            </pre>
        </main>
    )
}

export default ApiTest