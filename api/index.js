// Vercel entry point: every /api/* request is rewritten to this function (see vercel.json).
import server from '../src/app.js'

export default server.createServer()
