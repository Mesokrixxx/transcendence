import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Page } from './Home/Home.styles';

function TermsOfService() {
  const { t } = useTranslation();
  return (
    <Page>
      <Navbar />
      <main className="container" style={{ flex: 1 }}>
        <h1>{t('termsOfService', { ns: 'legal' })}</h1>
        <p>{t('termsIntro', { ns: 'legal' })}</p>
        <h2>{t('applicationUse', { ns: 'legal' })}</h2>
        <p>{t('usersMust', { ns: 'legal' })}</p>
        <h2>{t('userAccounts', { ns: 'legal' })}</h2>
        <p>{t('usersAreResponsibleFor', { ns: 'legal' })}</p>
        <h2>{t('fairPlay', { ns: 'legal' })}</h2>
        <p>{t('usersMustNot', { ns: 'legal' })}</p>
        <h2>{t('accountRestrictions', { ns: 'legal' })}</h2>
        <p>{t('accountsMayBe', { ns: 'legal' })}</p>
        <h2>{t('availability', { ns: 'legal' })}</h2>
        <p>{t('thisIsAStudentProject', { ns: 'legal' })}</p>
        <h2>{t('disclaimer', { ns: 'legal' })}</h2>
        <p>{t('educationalPurposes', { ns: 'legal' })}</p>
        <h2>{t('credits', { ns: 'legal' })}</h2>
        <p>
          {t('chessPieceArtwork', { ns: 'legal' })}{' '}
          <a href="https://github.com/philatype/kosal">
            {t('kosalByPhilatype', { ns: 'legal' })}
          </a>
          {t('licensedUnder', { ns: 'legal' })}{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/">
            {t('creativeCommonsAttribution', { ns: 'legal' })}
          </a>
          .
        </p>
      </main>
      <Footer />
    </Page>
  );
}

export default TermsOfService;
