import { createContext } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Store from './store/store';
import './index.css';
import './reset.scss';

interface State {
  store: Store;
}


const store = new Store();


export const Context = createContext<State>({
  store,
});


let container: any = null;

document.addEventListener('DOMContentLoaded', function () {
  if (!container) {
    container = document.getElementById('root') as HTMLElement;
    const root = createRoot(container);
    root.render(
      <Context.Provider value={{ store }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Context.Provider>
    );
  }
});