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
        <h1>{t('legal:termsOfService')}</h1>
        <p>{t('legal:termsIntro')}</p>
        <h2>{t('legal:applicationUse')}</h2>
        <p>{t('legal:usersMust')}</p>
        <h2>{t('legal:userAccounts')}</h2>
        <p>{t('legal:usersAreResponsibleFor')}</p>
        <h2>{t('legal:fairPlay')}</h2>
        <p>{t('legal:usersMustNot')}</p>
        <h2>{t('legal:accountRestrictions')}</h2>
        <p>{t('legal:accountsMayBe')}</p>
        <h2>{t('legal:availability')}</h2>
        <p>{t('legal:thisIsAStudentProject')}</p>
        <h2>{t('legal:disclaimer')}</h2>
        <p>{t('legal:educationalPurposes')}</p>
        <h2>{t('legal:credits')}</h2>
        <p>
          {t('legal:chessPieceArtwork')}{' '}
          <a href="https://github.com/philatype/kosal">
            {t('legal:kosalByPhilatype')}
          </a>
          {t('legal:licensedUnder')}{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/">
            {t('legal:creativeCommonsAttribution')}
          </a>
          .
        </p>
      </main>
      <Footer />
    </Page>
  );
}

export default TermsOfService;
