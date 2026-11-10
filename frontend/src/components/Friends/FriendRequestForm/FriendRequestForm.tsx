import { useState, type ChangeEvent, type FormEvent } from "react"
import { useTranslation } from "react-i18next"
import {
    Form,
    Fields,
    Input,
    SubmitButton,
    Feedback
} from './FriendRequestForm.styles'

type Status = 'idle' | 'sending' | 'sent' | 'error'

type FriendRequestFormProps = {
    onSend: (username: string) => Promise<void>
}

function FriendRequestForm({ onSend }: FriendRequestFormProps) {
    const { t } = useTranslation('friends')

    const [username, setUsername] = useState('')
    const [status, setStatus] = useState<Status>('idle')
    const [sentTo, setSentTo] = useState('')

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setUsername(event.target.value)
        if (status === 'sent' || status === 'error') {
            setStatus('idle')
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const name = username.trim()
        if (name === '') return

        setStatus('sending')
        onSend(name)
            .then(() => {
                setSentTo(name)
                setStatus('sent')
                setUsername('')
            })
            .catch(() => setStatus('error'))
    }

    const isSending = status === 'sending'
    const canSubmit = username.trim() != '' && !isSending

    return (
        <Form onSubmit={handleSubmit}>
            <Fields>
                <Input
                    type="text"
                    value={username}
                    onChange={handleChange}
                    placeholder={t('usernamePlaceholder')}
                    aria-label={t('usernameLabel')}
                    maxLength={32}
                    autoComplete="off"
                />
                <SubmitButton type="submit" disabled={!canSubmit}>
                    {isSending ? t('sending') : t('sendRequest')}
                </SubmitButton>
            </Fields>

            {status === 'sent' && (
                <Feedback role="status">{t('requestSent', { username: sentTo })}</Feedback>
            )}
            {status === 'error' && (
                <Feedback role="alert" $isError>{t('requestError')}</Feedback>
            )}
        </Form>
    )
}

export default FriendRequestForm