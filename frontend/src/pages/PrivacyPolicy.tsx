import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Page } from './Home/Home.styles';

function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <Page>
      <Navbar />
      <main className="container" style={{ flex: 1 }}>
        <h1>{t('privacyPolicy', { ns: 'legal' })}</h1>
        <p>{t('privacyIntro', { ns: 'legal' })}</p>
        <h2>{t('dataWeCollect', { ns: 'legal' })}</h2>
        <p>{t('weMayCollectInformationSuchAs', { ns: 'legal' })}</p>
        <ul>
          <li>{t('emailAddress', { ns: 'auth' })}</li>
          <li>{t('username', { ns: 'auth' })}</li>
          <li>{t('profileInformationAndAvatar', { ns: 'profile' })}</li>
          <li>{t('gameHistoryAndScores', { ns: 'chess' })}</li>
        </ul>
        <h2>{t('howWeUseYourData', { ns: 'legal' })}</h2>
        <p>{t('thisDataIsUsedOnlyTo', { ns: 'legal' })}</p>
        <h2>{t('dataStorage', { ns: 'legal' })}</h2>
        <p>{t('userDataIsStoredOnlyFor', { ns: 'legal' })}</p>
        <h2>{t('yourRights', { ns: 'legal' })}</h2>
        <p>{t('usersMayRequestAccess', { ns: 'legal' })}</p>
        <h2>{t('contact', { ns: 'legal' })}</h2>
        <p>{t('notIntendedForCommercialUse', { ns: 'legal' })}</p>
      </main>
      <Footer />
    </Page>
  );
}

export default PrivacyPolicy;
