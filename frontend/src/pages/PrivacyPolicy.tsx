import Navbar from '../components/Navbar/Navbar'
import { Page } from './Home/Home.styles'
import Footer from '../components/Footer/Footer'

function PrivacyPolicy() {
  return (
    <Page>
      <Navbar/>
        <main className="container" style={{ flex: 1 }}>
          <h1>Privacy Policy</h1>
          {/* <h1>{t('privacy.title')}</h1> */}

          <p>
            Chess Move is a student project developed as part of the 42 curriculum.
            This Privacy Policy explains how user data may be collected and used
            within the application.
          </p>

          <h2>Data we collect</h2>
          <p>
            Depending on the features used, we may collect information such as:
          </p>

          <ul>
            <li>Email address</li>
            <li>Username</li>
            <li>Profile information and avatar</li>
            <li>Game history and scores</li>
          </ul>

          <h2>How we use your data</h2>
          <p>
            This data is used only to provide the features of the application,
            including account management, multiplayer games, rankings, statistics,
            and social features.
          </p>

          <h2>Data storage</h2>
          <p>
            User data is stored only for the purposes of operating the application.
            Reasonable security measures are used to protect stored information.
          </p>

          <h2>Your rights</h2>
          <p>
            Users may request access to their personal data and, where available,
            request its deletion or export.
          </p>

          <h2>Contact</h2>
          <p>
            This application is a student project and is not intended for commercial
            use.
          </p>
        </main>
      <Footer />
    </Page>
  )
  
}

export default PrivacyPolicy