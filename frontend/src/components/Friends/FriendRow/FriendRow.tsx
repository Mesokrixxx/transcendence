import { type ReactNode } from "react"
import Avatar from "../../Avatar/Avatar"
import type { FriendUser } from "../friends.services"
import { Row, Name, Actions } from './FriendRow.styles'

type FriendRowProps = {
    user: FriendUser
    children?: ReactNode
}

function FriendRow({ user, children }: FriendRowProps) {
    return (
        <Row>
            <Avatar
                src={user.avatar}
                username={user.username}
                isOnline={user.isOnline}
                size={40}
            />
            <Name title={user.username}>{user.username}</Name>
            {children && <Actions>{children}</Actions>}
        </Row>
    )
}

export default FriendRow