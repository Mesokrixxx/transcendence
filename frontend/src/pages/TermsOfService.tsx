import { Trans, useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Page } from './Home/Home.styles';

function TermsOfService() {
  const { t } = useTranslation('legal');

  return (
    <Page>
      <Navbar />
      <main className="container" style={{ flex: 1 }}>
        <h1>{t('termsOfService')}</h1>
        <p>{t('termsIntro')}</p>
        <h2>{t('applicationUse')}</h2>
        <p>{t('usersMust')}</p>
        <h2>{t('userAccounts')}</h2>
        <p>{t('usersAreResponsibleFor')}</p>
        <h2>{t('fairPlay')}</h2>
        <p>{t('usersMustNot')}</p>
        <h2>{t('accountRestrictions')}</h2>
        <p>{t('accountsMayBe')}</p>
        <h2>{t('availability')}</h2>
        <p>{t('thisIsAStudentProject')}</p>
        <h2>{t('disclaimer')}</h2>
        <p>{t('educationalPurposes')}</p>
        <h2>{t('credits')}</h2>
        <p>
          <Trans
            ns="legal"
            i18nKey="chessPieceArtworkCredit"
            components={{
              kosal: <a href="https://github.com/philatype/kosal" />,
              license: <a href="https://creativecommons.org/licenses/by/4.0/" />,
            }}
          />
        </p>
      </main>
      <Footer />
    </Page>
  );
}

export default TermsOfService;
