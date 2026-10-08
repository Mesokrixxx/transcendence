import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import ChessBoard from '../../components/ChessBoard/ChessBoard'
import Button from '../../components/Button/Button'
import { Page, Content, Intro, Aside } from './../Home/Home.styles'

function Home() {
  return (
    <Page>
      <Navbar />

      <Content className="container">
        <Intro>
          <h1>Make your <span>move!</span></h1>
          <Button to="\play" variant="accent">GET STARTED</Button>
        </Intro>

        <ChessBoard />

        <Aside />
      </Content>

      <Footer />
    </Page>
  )
}

export default Home