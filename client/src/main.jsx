import React from 'react'
import * as Sentry from '@sentry/react';
// import { BrowserTracing } from '@sentry/react'
// import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { NewDocumentProvider } from './context/NewDocumentContext.jsx'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/da'; // Import Danish locale for dayjs
import { daDK } from '@mui/x-date-pickers/locales';
import updateLocale from 'dayjs/plugin/updateLocale'
import { BesøgProvider } from './context/BesøgContext.jsx'
import { TaskAndDateProvider } from './context/TaskAndDateContext.jsx'
import { OverblikViewProvider } from './context/OverblikViewContext.jsx'
import { IndstillingerProvider } from './context/IndstillingerContext.jsx'
import { NotifikationProvider } from './context/NotifikationContext.jsx'

Sentry.init({
  dsn: 'https://83dbd12ed4e8b7ad6d5d2b0acf4ce7e0@o4510158250049536.ingest.de.sentry.io/4510158252998736',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
})

dayjs.extend(updateLocale)
dayjs.locale('da');
dayjs.updateLocale('en', {
    weekStart: 1,
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider>
      <NotifikationProvider>
        <IndstillingerProvider>
          <BesøgProvider>
            <OverblikViewProvider>
              <TaskAndDateProvider>
                <NewDocumentProvider>
                  <LocalizationProvider 
                    dateAdapter={AdapterDayjs} 
                    adapterLocale="da" // Set the locale for AdapterDayjs
                    localeText={daDK.components.MuiLocalizationProvider.defaultProps.localeText}
                  >
                    <App />
                  </LocalizationProvider>
                </NewDocumentProvider>
              </TaskAndDateProvider>
            </OverblikViewProvider>
          </BesøgProvider>
        </IndstillingerProvider>
      </NotifikationProvider>
    </AuthContextProvider>
  </React.StrictMode>
)