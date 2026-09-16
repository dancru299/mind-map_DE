import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { UserDataProvider } from './store/UserData'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserDataProvider>
      <App />
    </UserDataProvider>
  </StrictMode>,
)
