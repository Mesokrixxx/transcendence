import { useState } from 'react'
// import { fakerEN as faker } from '@faker-js/faker'
import fetchAPI from '../services/fetchAPI'
import type { AuthUser } from '../types/auth'
import Button from '../components/Button/Button'


function ApiTest() {
    const [result, setResult] = useState('Test not started.')

    async function testAPI() {
        setResult('Loading...')

        const response = await fetchAPI<AuthUser>({
            path: '/auth/login',
            method: 'post',
            body: {}
        })

        setResult(JSON.stringify(response, null, 2))
    }

    return (
        <main className="container">
            <h1>API test — backend</h1>

            <Button onClick={testAPI}>
                Create test account
            </Button>

            <pre style={{ whiteSpace: 'pre-wrap', marginTop: 24 }}>
                {result}
            </pre>
        </main>
    )
}

export default ApiTest


// function ApiTest() {
//     const [result, setResult] = useState('Test not started.')

//     async function testAPI() {
//         if (!import.meta.env.DEV) {
//             setResult('Run npm run dev to use this simulation.')
//             return
//         }

//         const fakeUser: AuthUser = {
//             id: 1,
//             username: faker.internet.username(),
//             email: faker.internet.exampleEmail()
//         }

//         setResult('Loading...')

       
//         const originalFetch = window.fetch

//         window.fetch = async (input, options) => {
//             if (input === '/api/auth/login') {
//                 return new Response(
//                     'This is not JSON',
//                     {
//                         status: 200,
//                         headers: {
//                             'Content-Type': 'application/json'
//                         }
//                     }
//                 )
//                 // return new Response(
//                 //     JSON.stringify({ error: 'Invalid credentials' }),
//                 //     {
//                 //         status: 401,
//                 //         headers: {
//                 //             'Content-Type': 'application/json'
//                 //         }
//                 //     }
//                 // )
//             }

//             return originalFetch.call(window, input, options)
//         }

//         try {
//             const response = await fetchAPI<void>({
//                 path: '/auth/login',
//                 method: 'post',
//                 body: {
//                     email: fakeUser.email,
//                     password: 'FakePassword123!'
//                 }
//             })

//             setResult(JSON.stringify(response, null, 2))
//         } finally {
//             window.fetch = originalFetch
//         }
//     }

//     return (
//         <main className="container">
//             <h1>API test — simulated response</h1>

//             <Button onClick={testAPI}>
//                 Test invalid JSON
//             </Button>

//             <pre style={{ whiteSpace: 'pre-wrap', marginTop: 24 }}>
//                 {result}
//             </pre>
//         </main>
//     )
// }

// export default ApiTest