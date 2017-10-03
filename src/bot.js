const recastai = require('recastai').default
const client = new recastai(process.env.REQUEST_TOKEN)
const request = require('request')


export const bot = (body, response, callback) => {
  console.log(body)

  if (body.message) {
    client.connect.handleMessage({ body }, response, replyMessage)
    callback(null, { result: 'Bot answered :)' })
  } else if (body.text) {
    replyMessage(null, body.text, response)
  } else {
    callback('No text provided')
  }
}

const replyMessage = (message, text, res) => {
  const recastaiReq = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE)
  const content = (message ? message.content : text)

  recastaiReq.analyseText(content)
  .then(recastaiRes => {
    if (recastaiRes.entities.hasOwnProperty('category')) {
      request('https://api.chucknorris.io/jokes/categories', (_err, _res, body) => {
        let response = JSON.parse(body)
        let category = recastaiRes.entities.category[0].value
        if (response.indexOf(category)) {
          request(`https://api.chucknorris.io/jokes/random?category=${category}`, (_err, _res, body) => {
            body = JSON.parse(body)
            const content = body.value
            
            return message ? message.reply([{ type: 'text', content }]).then() : res.json({ reply: content })
          })
        } else {
          request('https://api.chucknorris.io/jokes/categories', (_err, _res, body) => {
            body = JSON.parse(body)
            const content = `Sorry, I only know about these categories: ${body.join(', ')}.`
            
            return message ? message.reply([{ type: 'text', content }]).then() : res.json({ reply: content })
          })
        }
      })
    } else {
      request('https://api.chucknorris.io/jokes/random', (_err, _res, body) => {
        body = JSON.parse(body)
        const content = body.value
  
        return message ? message.reply([{ type: 'text', content }]).then() : res.json({ reply: content })
      })
    }
  })
}