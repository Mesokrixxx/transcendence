import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Page } from './Home/Home.styles';

function PrivacyPolicy() {
  const { t: tLegal } = useTranslation('legal');
  const { t: tAuth } = useTranslation('auth');
  const { t: tProfile } = useTranslation('profile');
  const { t: tChess } = useTranslation('chess');

  return (
    <Page>
      <Navbar />
      <main className="container" style={{ flex: 1 }}>
        <h1>{tLegal('privacyPolicy')}</h1>
        <p>{tLegal('privacyIntro')}</p>
        <h2>{tLegal('dataWeCollect')}</h2>
        <p>{tLegal('weMayCollectInformationSuchAs')}</p>
        <ul>
          <li>{tAuth('emailAddress')}</li>
          <li>{tAuth('username')}</li>
          <li>{tProfile('profileInformationAndAvatar')}</li>
          <li>{tChess('gameHistoryAndScores')}</li>
        </ul>
        <h2>{tLegal('howWeUseYourData')}</h2>
        <p>{tLegal('thisDataIsUsedOnlyTo')}</p>
        <h2>{tLegal('dataStorage')}</h2>
        <p>{tLegal('userDataIsStoredOnlyFor')}</p>
        <h2>{tLegal('yourRights')}</h2>
        <p>{tLegal('usersMayRequestAccess')}</p>
        <h2>{tLegal('contact')}</h2>
        <p>{tLegal('notIntendedForCommercialUse')}</p>
      </main>
      <Footer />
    </Page>
  );
}

export default PrivacyPolicy;
