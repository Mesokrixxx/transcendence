import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';

type PlayGameActionsProps = {
  drawRequestSent: boolean;
  onOfferDraw: () => void;
  onResign: () => void;
};

export default function PlayGameActions({
  drawRequestSent,
  onOfferDraw,
  onResign,
}: PlayGameActionsProps) {
  const { t } = useTranslation('chess');

  return (
    <div role="group" aria-label={t('gameActions')}>
      <Button variant="secondary" onClick={onOfferDraw}>
        {drawRequestSent ? t('drawRequestSent') : t('offerDraw')}
      </Button>
      <Button variant="secondary" onClick={onResign}>
        {t('resign')}
      </Button>
    </div>
  );
}