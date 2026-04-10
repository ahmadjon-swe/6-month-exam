import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  const refresh = localStorage.getItem('refresh_token')
  if (refresh) config.headers['x-refresh-token'] = refresh

  return config
})

// Handle new access token from header + 401 fallback
api.interceptors.response.use(
  (response) => {
    const newToken = response.headers['x-new-access-token']
    if (newToken) localStorage.setItem('access_token', newToken)
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
