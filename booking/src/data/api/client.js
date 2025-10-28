import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

// Simpel error-handling
client.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API-fejl:', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

export default client