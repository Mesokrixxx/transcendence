import { type ReactNode } from "react"
import FriendRow from "../FriendRow/FriendRow"
import type { FriendUser } from "../friends.services"
import {
    Section,
    Header,
    Title,
    Count,
    List,
    EmptyMessage
} from "./FriendSection.styles"

type FriendSectionProps = {
    title: string
    emptyMessage: string
    users: FriendUser[]
    renderActions?: (user: FriendUser) => ReactNode
}

function FriendSection({
    title,
    emptyMessage,
    users,
    renderActions
}: FriendSectionProps) {
    return (
        <Section>
            <Header>
                <Title>{title}</Title>
                <Count>{users.length}</Count>
            </Header>

            { users.length === 0 ? (
                <EmptyMessage>{emptyMessage}</EmptyMessage>
            ) : (
                <List>
                    {users.map((user) => (
                        <FriendRow key={user.id} user={user}>
                            {renderActions?.(user)}
                        </FriendRow>
                    ))}
                </List>
            )}
        </Section>
    )
}

export default FriendSection