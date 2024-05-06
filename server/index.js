const express = require('express')
const app = express()
const {
  addOrUpdateCharacter,
  getCharacters,
  deleteCharacter,
  getCharacterById
} = require('./dynamo')
const { uploadImage, getImages } = require('./s3')
const { generateUid } = require('./helpers/common')
const bodyParser = require('body-parser') // Import the 'body-parser' package
const cors = require('cors') // Import the 'cors' package
app.use(cors()) // Use the 'cors' middleware to enable CORS
app.use(bodyParser.json({ limit: '10mb' })) // Increase the limit of the request payload size to 10mb

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/images', async (req, res) => {
  try {
    const characters = await getCharacters()
    const images = await getImages()
    res.json(images)
  } catch (err) {
    console.error(err)
    res.status(500).json({ err: 'Something went wrong' })
  }
})

app.get('/images/:id', async (req, res) => {
  const id = req.params.id
  try {
    const character = await getCharacterById(id)
    res.json(character)
  } catch (err) {
    console.error(err)
    res.status(500).json({ err: 'Something went wrong' })
  }
})

app.post('/images', async (req, res) => {
  const image = req.body
  try {
    const id = generateUid()
    const imageId = image.id
    const newImage = await uploadImage({ ...image, id: id + imageId })
    res.json(newImage)
  } catch (err) {
    console.error(err)
    res.status(500).json({ err: 'Something went wrong' })
  }
})

app.put('/images/:id', async (req, res) => {
  const character = req.body
  const { id } = req.params
  character.id = id
  try {
    const newCharacter = await addOrUpdateCharacter(character)
    res.json(newCharacter)
  } catch (err) {
    console.error(err)
    res.status(500).json({ err: 'Something went wrong' })
  }
})

app.delete('/images/:id', async (req, res) => {
  const { id } = req.params
  try {
    res.json(await deleteCharacter(id))
  } catch (err) {
    console.error(err)
    res.status(500).json({ err: 'Something went wrong' })
  }
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
