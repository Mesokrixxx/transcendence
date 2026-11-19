import { type ReactNode } from "react"
import { Link } from 'react-router-dom'
import Avatar from "../../Avatar/Avatar"
import type { FriendUser } from "../../../services/friends"
import { Row, Name, Actions } from './FriendRow.styles'

type FriendRowProps = {
    user: FriendUser
    children?: ReactNode
}

function FriendRow({ user, children }: FriendRowProps) {
    return (
        <Row>
            <Avatar
                src={user.avatar || '/avatars/default.svg'}
                username={user.username}
                isOnline={user.isOnline}
                size={40}
            />
            <Name as={Link} to={`/profile/${user.id}`} title={user.username}>
                <span style={{ display: 'block' }}>
                    {user.displayName || user.username}
                </span>
                {user.displayName && user.displayName !== user.username && (
                    <small style={{ display: 'block', opacity: 0.75 }}>
                        @{user.username}
                    </small>
                )}
            </Name>
            {children && <Actions>{children}</Actions>}
        </Row>
    )
}

export default FriendRow