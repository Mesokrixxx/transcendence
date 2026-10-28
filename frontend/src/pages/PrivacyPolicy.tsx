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
        <h1>{t('legal:privacyPolicy')}</h1>
        <p>{t('legal:privacyIntro')}</p>
        <h2>{t('legal:dataWeCollect')}</h2>
        <p>{t('legal:weMayCollectInformationSuchAs')}</p>
        <ul>
          <li>{t('auth:emailAddress')}</li>
          <li>{t('auth:username')}</li>
          <li>{t('profile:profileInformationAndAvatar')}</li>
          <li>{t('chess:gameHistoryAndScores')}</li>
        </ul>
        <h2>{t('legal:howWeUseYourData')}</h2>
        <p>{t('legal:thisDataIsUsedOnlyTo')}</p>
        <h2>{t('legal:dataStorage')}</h2>
        <p>{t('legal:userDataIsStoredOnlyFor')}</p>
        <h2>{t('legal:yourRights')}</h2>
        <p>{t('legal:usersMayRequestAccess')}</p>
        <h2>{t('legal:contact')}</h2>
        <p>{t('legal:notIntendedForCommercialUse')}</p>
      </main>
      <Footer />
    </Page>
  );
}

export default PrivacyPolicy;
