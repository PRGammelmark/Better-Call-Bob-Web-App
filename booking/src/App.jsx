import { useEffect } from 'react'
import Styles from './App.module.css'
import PrimaryBookingComponent from './components/PrimaryBookingComponent'
import axios from 'axios'

function App() {
  // Fetch and update favicon from settings
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/indstillinger`)
        const faviconUrl = response.data?.bookingFavicon
        
        if (faviconUrl) {
          // Remove existing favicon links
          const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
          existingLinks.forEach(link => link.remove())
          
          // Create new favicon link
          const link = document.createElement('link')
          link.rel = 'icon'
          link.type = 'image/x-icon'
          link.href = faviconUrl
          document.head.appendChild(link)
        }
      } catch (error) {
        console.error('Error fetching favicon:', error)
      }
    }
    
    updateFavicon()
  }, [])

  return (
    <div className={Styles.app}>
      <PrimaryBookingComponent />
    </div>
  )
}

export default App
