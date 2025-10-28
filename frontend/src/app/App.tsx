import { Footer, Header } from '../pages';
import './App.css';
import { Navigation } from './router/Navigation';

function App() {

  return (
    <div className='app'>
      <Header />
      <Navigation />
      <Footer />
    </div>
  );
}

export default App;
