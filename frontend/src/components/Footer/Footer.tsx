import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Links } from './Footer.styles';

function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer>
      <Links className="container">
        <span>{t('copyright', { ns: 'common', year })}</span>
        <span aria-hidden="true">|</span>
        <Link to="/privacy">{t('privacyPolicy', { ns: 'legal' })}</Link>
        <span aria-hidden="true">|</span>
        <Link to="/terms">{t('termsOfService', { ns: 'legal' })}</Link>
      </Links>
    </footer>
  );
}

export default Footer;
