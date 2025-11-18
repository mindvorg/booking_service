import { Footer, Header } from '../pages';
import './App.css';
import { Navigation } from './router/Navigation';
import { observer } from 'mobx-react-lite';

function App() {

  return (
    <div className='app'>
      <Header />
      <Navigation />
      <Footer />
    </div>
  );
}

export default observer(App);
