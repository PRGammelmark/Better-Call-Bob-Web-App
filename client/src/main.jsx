import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/da'; // Import Danish locale for dayjs
import { daDK } from '@mui/x-date-pickers/locales';
import updateLocale from 'dayjs/plugin/updateLocale'

dayjs.extend(updateLocale)
dayjs.locale('da'); // Set dayjs to use Danish locale globally
dayjs.updateLocale('en', {
    weekStart: 1,
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider>
      <LocalizationProvider 
        dateAdapter={AdapterDayjs} 
        adapterLocale="da" // Set the locale for AdapterDayjs
        localeText={daDK.components.MuiLocalizationProvider.defaultProps.localeText}
      >
        <App />
      </LocalizationProvider>
    </AuthContextProvider>
  </React.StrictMode>
)
