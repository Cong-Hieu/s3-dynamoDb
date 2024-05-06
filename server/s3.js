const AWS = require('aws-sdk')
const { generateUid } = require('./helpers/common')
require('dotenv').config({ path: __dirname + '/.env' })

const s3 = new AWS.S3({
  region: process.env.AWS_DEFAULT_REGION,
  Bucket: process.env.AWS_BUCKET_NAME
})

const uploadImage = async (file) => {
  const buf = Buffer.from(
    file.src.replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  )

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `images/${file.id}`,
    Body: buf,
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg'
  }
  return await s3.upload(params).promise()
}

const getImages = async () => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME
  }
  try {
    const response = await s3.listObjectsV2(params).promise()
    const images = response.Contents.map((image) => {
      const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${image.Key}`
      if (!image.Key.endsWith('/')) {
        return { id: image.Key, src: imageUrl }
      }
    }).filter(Boolean)
    return images
  } catch (error) {
    console.error('Error getting images from S3:', error)
    throw error
  }
}
module.exports = { uploadImage, getImages }
