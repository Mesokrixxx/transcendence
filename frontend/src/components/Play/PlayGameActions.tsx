import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';

type PlayGameActionsProps = {
  drawRequestSent: boolean;
  onClaimDraw?: () => void;
  onOfferDraw: () => void;
  onResign: () => void;
};

export default function PlayGameActions({
  drawRequestSent,
  onClaimDraw,
  onOfferDraw,
  onResign,
}: PlayGameActionsProps) {
  const { t } = useTranslation('chess');

  return (
    <div role="group" aria-label={t('gameActions')}>
      {onClaimDraw ? (
        <Button variant="secondary" onClick={onClaimDraw}>
          {t('claimDraw')}
        </Button>
      ) : (
        <Button variant="secondary" onClick={onOfferDraw}>
          {drawRequestSent ? t('drawRequestSent') : t('offerDraw')}
        </Button>
      )}
      <Button variant="secondary" onClick={onResign}>
        {t('resign')}
      </Button>
      {onClaimDraw && <p>{t('claimDrawAvailable')}</p>}
    </div>
  );
}
