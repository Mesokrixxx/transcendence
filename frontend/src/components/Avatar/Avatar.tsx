import { AvatarWrapper, AvatarImage, AvatarFallback, StatusDot } from './Avatar.styles'

type AvatarProps = {
    src?: string
    username: string
    isOnline?: boolean
    size?: number
}

function Avatar({ src, username, isOnline, size = 64}: AvatarProps)
{
    return(
        <AvatarWrapper $size={size}>
            {src ? (
                <AvatarImage src={src} alt={`Avatar of ${username}`} />
            ) : (
                <AvatarFallback aria-label={`Avatar of ${username}`}>
                    {username.charAt(0).toUpperCase()}
                </AvatarFallback>
            )}
            
            {isOnline !== undefined && (
                <StatusDot 
                    $isOnline={isOnline}
                    role="img"
                    aria-label={isOnline ? 'Online' : 'Offline'}
                    title={isOnline ? 'Online' : 'Offline'}
                />
            )}
        </AvatarWrapper>
    )
} export default Avatar