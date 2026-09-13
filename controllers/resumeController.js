const { parseResume, saveLastResumePdf } = require('../services/resumeService')

async function parseResumeUpload(request, response, next) {
  if (!request.file) return response.status(400).json({ error: 'Attach a PDF or DOCX resume using the "resume" form field.' })

  try {
    console.info(`[resume] Parsing ${request.file.originalname}.`)
    saveLastResumePdf(request.file)
    const parsedResume = await parseResume(request.file)
    return response.status(200).json({
      fileName: request.file.originalname,
      parsedAt: new Date().toISOString(),
      ...parsedResume,
    })
  } catch (error) {
    console.error(`[resume] Unable to parse ${request.file.originalname}: ${error.message}`)
    return response.status(500).json({ error: 'Unable to parse the uploaded resume.' })
  }
}

module.exports = { parseResume: parseResumeUpload }