import { useEffect, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import FriendSection from "../FriendSection/FriendSection"
import FriendRequestForm from "../FriendRequestForm/FriendRequestForm"
import { getFriends,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    type FriendUser,
    type FriendsData } from "../friends.services"
import {
    Panel,
    PanelHeader,
    CloseButton,
    Message,
    ActionButton
} from "./FriendsPanel.styles"

type FriendsPanelProps = {
    onClose?: () => void;
    embedded?: boolean;
};

function without(list: FriendUser[], user:FriendUser): FriendUser[] {
    return list.filter((item) => item.id !== user.id)
}

function FriendsPanel({ onClose, embedded = false }: FriendsPanelProps) {
    const { t } = useTranslation('friends')

    const [data, setData] = useState<FriendsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [isBusy, setIsBusy] = useState(false)
    const [hasActionError, sethasActionError] = useState(false)


    useEffect(() => {
        getFriends()
            .then((result) => setData(result))
            .catch(() => setHasError(true))
            .finally(() => setIsLoading(false))
    }, [])

    function handleSend(username: string): Promise<void> {
        return sendFriendRequest(username).then((user) => {
            setData((current) =>
                current === null ? current : { ...current, sent: [...current.sent, user]}
            )
        })
    }

    function runAction(
        action: () => Promise<void>,
        update: (current : FriendsData) => FriendsData
    ) {
        setIsBusy(true)
        sethasActionError(false)

        action()
            .then(() => {
                setData((current) => (current === null ? current : update(current)))
            })
            .catch(() => sethasActionError(true))
            .finally(() => setIsBusy(false))
    }

    function handleAccept(user: FriendUser) {
        runAction(
            () => acceptFriendRequest(user.id),
            (current) => ({
                ...current,
                received: without(current.received, user),
                friends: [...current.friends, user]
            })
        )
    }

    function handleDecline(user: FriendUser) {
        runAction(
            () => removeFriendRequest(user.id),
            (current) => ({
                ...current,
                received: without(current.received, user)
            })
        )
    }

    function handleCancel(user: FriendUser) {
        runAction(
            () => removeFriendRequest(user.id),
            (current) => ({
                ...current,
                sent: without(current.sent, user)
            })
        )
    }

    function handleRemove(user: FriendUser) {
        runAction(
            () => removeFriend(user.id),
            (current) => ({
                ...current,
                friends: without(current.friends, user)
            })
        )
    }

    function handleBlock(user: FriendUser) {
        runAction(
            () => blockUser(user.id),
            (current) => ({
                ...current,
                friends: without(current.friends, user),
                blocked: [...current.blocked, user]
            })
        )
    }

    function handleUnBlock(user: FriendUser) {
        runAction(
            () => unblockUser(user.id),
            (current) => ({
                ...current,
                blocked: without(current.blocked, user),
            })
        )
    }

    let content: ReactNode
    if (isLoading) {
        content = <Message>{t('loading')}</Message>
    } else if (hasError || data == null) {
        content = <Message role="alert">{t('loadError')}</Message>
    } else {
        content = (
            <>
                <FriendRequestForm onSend={handleSend}/>

                {hasActionError && <Message role="alert">{t('actionError')}</Message>}

                <FriendSection
                    title={t('friendsTitle')}
                    emptyMessage={t('noFriendsYet')}
                    users={data.friends}
                    renderActions={(user) => (
                        <>
                            <ActionButton type="button" disabled={isBusy} onClick={() => handleRemove(user)}>
                                {t('remove')}
                            </ActionButton>
                            <ActionButton type="button" disabled={isBusy} onClick={() => handleBlock(user)}>
                                {t('block')}
                            </ActionButton>
                        </>
                    )}
                />
                <FriendSection
                    title={t('receivedRequestsTitle')}
                    emptyMessage={t('noReceivedRequests')}
                    users={data.received}
                    renderActions={(user) => (
                        <>
                            <ActionButton type="button" disabled={isBusy} onClick={() => handleAccept(user)}>
                                {t('accept')}
                            </ActionButton>
                            <ActionButton type="button" disabled={isBusy} onClick={() => handleDecline(user)}>
                                {t('decline')}
                            </ActionButton>
                        </>
                    )}
                />
                <FriendSection
                    title={t('sentRequestsTitle')}
                    emptyMessage={t('noSentRequests')}
                    users={data.sent}
                    renderActions={(user) => (
                            <ActionButton type="button" disabled={isBusy} onClick={() => handleCancel(user)}>
                                {t('cancel')}
                            </ActionButton>
                    )}
                />
                <FriendSection
                    title={t('blockedTitle')}
                    emptyMessage={t('noBlockedPlayers')}
                    users={data.blocked}
                    renderActions={(user) => (
                            <ActionButton type="button" disabled={isBusy} onClick={() => handleUnBlock(user)}>
                                {t('unblock')}
                            </ActionButton>
                    )}
                />
            </>
        )
    }

    return (
        <Panel $embedded={embedded} id="friends-panel" aria-labelledby="friends-panel-title">
            <PanelHeader>
                {!embedded && onClose && (
                    <CloseButton
                        type="button"
                        onClick={onClose}
                        aria-label={t('closePanel')}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </CloseButton>
                )}
            </PanelHeader>

            {content}

        </Panel>
    )
}

export default FriendsPanel