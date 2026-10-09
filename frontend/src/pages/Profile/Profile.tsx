import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import Avatar from '../../components/Avatar/Avatar'
import { Page } from '../Home/Home.styles'
import { ProfilePanel, ProfileHeader } from './Profile.styles'

function Profile() {
    return (
        <Page>
            <Navbar />

            <main className="container">
                <ProfilePanel>
                    <ProfileHeader>
                        <Avatar
                            username="UserName"
                            isOnline={true}
                            size={96}
                        />

                        <div>
                            <h1>UserName</h1>
                            <p>Online</p>
                        </div>
                    </ProfileHeader>
                </ProfilePanel>
            </main>

            <Footer />
        </Page>
    )
}

export default Profile