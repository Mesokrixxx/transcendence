import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import Avatar from '../../components/Avatar/Avatar'
import Button from '../../components/Button/Button'
import { Page } from '../Home/Home.styles'
import { ProfilePanel, ProfileHeader, AvatarUpload } from './Profile.styles'

function Profile() {
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarSrc, setAvatarSrc] = useState<string>()
    const [avatarError, setAvatarError] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    useEffect(()=> {
        if(!avatarFile)
            return

        const previewUrl = URL.createObjectURL(avatarFile)
        setAvatarSrc(previewUrl)

        return () => URL.revokeObjectURL(previewUrl)

    }, [avatarFile])

    function handleAvatarChange(event: ChangeEvent<HTMLInputElement>){
        const file = event.target.files?.[0]
        event.target.value = ''

        if (!file) 
            return
        if(!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        {   setAvatarError('Please choose a JPG, PNG or WebP image.')
            return
        }
            

        if (file.size > 2 * 1024 * 1024)
        {
            setAvatarError('The image must be no larger than 2MB.')
            return
        }

        setAvatarError('')
        setAvatarFile(file)
    }
    return (
        <Page>
            <Navbar />

            <main className="container">
                <ProfilePanel>
                    <ProfileHeader>
                        <Avatar
                            src={avatarSrc}
                            username="UserName"
                            isOnline={true}
                            size={96}
                        />

                        <div className="profile-info">
                            <h1>UserName</h1>
                            <p>Online</p>
                        </div>

                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={()=> setIsEditing(!isEditing)}
                            aria-expanded={isEditing}
                            aria-controls="profile-edit"
                        >
                            {isEditing ? 'Close' : 'Edit profile'}

                        </Button>
                    </ProfileHeader>

                    {isEditing && (
                    <AvatarUpload id="profile-edit">
                        <label htmlFor="profile-avatar">
                            Change avatar
                        </label>

                        <input
                            id="profile-avatar"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarChange}
                            aria-describedby="avatar-help avatar-error"
                        />

                        <p id="avatar-help">
                            JPG, PNG or WebP. Maximum 2 MB.
                        </p>

                        <p id="avatar-error" role="alert">
                            {avatarError}
                        </p>
                    </AvatarUpload>
                )}
                </ProfilePanel>
            </main>

            <Footer />
        </Page>
    )
}

export default Profile