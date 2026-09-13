const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')

const tokenFilePath = path.resolve(__dirname, 'googleTokens.json')

function loadRefreshToken() {
  if (!fs.existsSync(tokenFilePath)) return undefined

  const { refreshToken } = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'))
  return refreshToken
}

function saveRefreshToken(refreshToken) {
  if (!refreshToken) return
  fs.writeFileSync(tokenFilePath, `${JSON.stringify({ refreshToken }, null, 2)}\n`, { mode: 0o600 })
}

function getGoogleOAuthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    const error = new Error('Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.')
    error.status = 503
    throw error
  }

  const oauthClient = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
  const refreshToken = loadRefreshToken()
  if (refreshToken) oauthClient.setCredentials({ refresh_token: refreshToken })
  return oauthClient
}

module.exports = { getGoogleOAuthClient, google, saveRefreshToken }