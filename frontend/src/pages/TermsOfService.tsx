import Navbar from "../components/Navbar/Navbar"
import { Page } from './Home.styles'
import Footer from '../components/Footer/Footer'


function TermsOfService() {
  return (
    <Page>
      <Navbar/>
      <main className="container" style={{ flex: 1 }}>
        <h1>Terms of Service</h1>

        <p>
          Chess Move is a student project developed as part of the 42 curriculum.
          By using this application, you agree to follow the rules described below.
        </p>

        <h2>Use of the application</h2>
        <p>
          Users must use the application responsibly and must not attempt to
          disrupt, damage, or misuse the service.
        </p>

        <h2>User accounts</h2>
        <p>
          Users are responsible for the information associated with their account
          and for keeping their credentials secure.
        </p>

        <h2>Fair play</h2>
        <p>
          Users must not cheat, exploit bugs, harass other players, or use the
          application in a way that negatively affects other users.
        </p>

        <h2>Account restrictions</h2>
        <p>
          Accounts may be restricted or removed in cases of abusive behaviour,
          cheating, or misuse of the platform.
        </p>

        <h2>Availability</h2>
        <p>
          As this is a student project, the service may be modified, interrupted,
          or unavailable without notice.
        </p>

        <h2>Disclaimer</h2>
        <p>
          This project is provided for educational purposes and is not a
          commercial service.
        </p>
      </main>
      <Footer />
     </Page>

  )
}

export default TermsOfService