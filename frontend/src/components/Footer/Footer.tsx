import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Links } from './Footer.styles';

function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer>
      <Links className="container">
        <span>{t('common:copyright', { year })}</span>
        <span aria-hidden="true">|</span>
        <Link to="/privacy">{t('legal:privacyPolicy')}</Link>
        <span aria-hidden="true">|</span>
        <Link to="/terms">{t('legal:termsOfService')}</Link>
      </Links>
    </footer>
  );
}

export default Footer;
