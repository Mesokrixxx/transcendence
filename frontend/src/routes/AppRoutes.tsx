import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home'
import Register from '../pages/Register'
import Login from '../pages/Login/Login'
import Profile from '../pages/Profile/Profile'
import PrivacyPolicy from '../pages/PrivacyPolicy'
import TermsOfService from '../pages/TermsOfService'

function AppRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
        </Routes>
    )
}

export default AppRoutes