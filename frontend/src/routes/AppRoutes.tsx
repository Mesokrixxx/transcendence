import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home'
import Play from '../pages/Play/Play'
import Watch from '../pages/Watch/Watch'
import Register from '../pages/Register'
import Login from '../pages/Login/Login'
import Profile from '../pages/Profile/Profile'
import PrivacyPolicy from '../pages/PrivacyPolicy'
import TermsOfService from '../pages/TermsOfService'
import Rankings from '../pages/Rankings/Rankings'
import Chat from '../pages/Chat/Chat'


function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<Play />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/chat" element={<Chat />} />
        </Routes>
    )
}

export default AppRoutes