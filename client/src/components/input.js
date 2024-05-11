import React, { useEffect, useState } from 'react'
const reader = new FileReader()

const Input = ({}) => {
  const [images, setImages] = useState([])
  const getImage = async () => {
    try {
      const response = await fetch('http://localhost:5000/orders')
      const data = await response.json()
      setImages(data)
      return data
      // Process the data and update the state or do something else with it
    } catch (error) {
      console.error('Error fetching image:', error)
      return null
    }
  }

  useEffect(() => {
    getImage()
  }, [])

  const postImage = async (imageData) => {
    try {
      const response = await fetch('http://localhost:8080/images', {
        method: 'POST',
        body: JSON.stringify(imageData),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      // Process the response data or do something else with it
      return data
    } catch (error) {
      console.error('Error posting image:', error)
      return null
    }
  }
  const uploadFileInput = async (event) => {
    const files = event.target.files
    reader.readAsDataURL(files[0])
    reader.addEventListener('load', async (event) => {
      const img = { id: files[0].name, src: event.target.result }
      await postImage(img)
      await getImage()
    })
  }

  return (
    <div>
      <input
        type='file'
        placeholder='Enter your name'
        id='file-upload'
        multiple
        onChange={(event) => uploadFileInput(event)}
      />
      {images.map((image) => (
        <img key={image.id} src={image.src} alt='Dinosaur' />
      ))}
    </div>
  )
}

export default Input
