import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './style/index.css';
import App from './App';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import ClientContextProvider from './context/ClientStateContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <ClientContextProvider>
    <HashRouter>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/lobby' element={<Lobby />} />
        <Route path='/game' element={<Game />} />
      </Routes>
    </HashRouter>
  </ClientContextProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
