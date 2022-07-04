const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

const newspapers = [
  {
    name: 'times',
    address: 'https://www.thetimes.co.uk/environment',
    base: ''
  },
  {
    name: 'guardian',
    address: 'https://www.theguardian.com/uk/environment',
    base: ''
  },
  {
    name: 'telegraph',
    address: 'https://www.telegraph.co.uk/global-health/climate-and-people/',
    base: 'https://www.telegraph.co.uk'
  }
]

const articles = []

app.get('/', (req, res) => {
  res.json('Welcome to my API')
})

app.get('/news', (req, res) => {
  newspapers.forEach(newspaper => {
    axios
      .get(newspaper.address)
      .then(response => {
        const html = response.data
        const $ = cheerio.load(html)

        $('a:contains("climate")', html).each(function () {
          const title = $(this).text()
          const url = $(this).attr('href')
          articles.push({
            title,
            url: newspaper.base + url,
            source: newspaper.name
          })
        })
        res.json(articles)
      })
      .catch(err => console.log(err))
  })
})

app.get('/news/:newspaperID', (req, res) => {
  const newspaperID = req.params.newspaperID

  const newspaper = newspapers.filter(newspaper => newspaper.name == newspaperID)[0]
  const newspaperAddress = newspaper && newspaper.address

  const newspaperBase = newspaper && newspaper.base

  newspaper &&
    axios
      .get(newspaperAddress)
      .then(response => {
        const html = response.data

        const $ = cheerio.load(html)
        const specificArticles = []

        $('a:contains("climate")', html).each(function () {
          const title = $(this).text()
          const url = $(this).attr('href')

          specificArticles.push({
            title,
            url: newspaperBase + url,
            source: newspaperID
          })
        })

        res.json(specificArticles)
      })
      .catch(err => console.log(err))

  !newspaper && res.json('Wrong ID')
})

app.listen(PORT, () => console.log(`server running on ${PORT}`))
