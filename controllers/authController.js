const { clientOrigin } = require('../config/environment')
const { getGoogleOAuthClient, google, saveRefreshToken } = require('../config/googleOAuth')

function getAuthUrl(request, response, next) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.info('[oauth] Google client ID is unavailable. Returning mock consent URL.')
      return response.json({ url: 'http://localhost:5174?google_connected=true', mock: true })
    }
    const authorizationUrl = getGoogleOAuthClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/gmail.send',
      ],
    })
    console.info('[oauth] Generated Google consent URL.')
    return response.json({ url: authorizationUrl })
  } catch (error) {
    return next(error)
  }
}

async function handleCallback(request, response, next) {
  if (!request.query.code) return response.status(400).json({ error: 'Missing Google OAuth authorization code.' })

  try {
    const oauthClient = getGoogleOAuthClient()
    const { tokens } = await oauthClient.getToken(request.query.code)
    oauthClient.setCredentials(tokens)
    saveRefreshToken(tokens.refresh_token)
    const { data: profile } = await google.oauth2({ version: 'v2', auth: oauthClient }).userinfo.get()
    console.info(`[oauth] Google account connected for ${profile.email || 'authenticated user'}.`)
    return response.redirect(`${clientOrigin}?google_connected=true`)
  } catch (error) {
    return next(error)
  }
}

module.exports = { getAuthUrl, handleCallback }