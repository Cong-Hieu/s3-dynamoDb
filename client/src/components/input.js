import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
const reader = new FileReader()

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Image = styled.img`
  width: 300px;
  object-fit: cover;
  border-radius: 10px;
`

const ImageContainer = styled.div`
  margin: 10px;
  text-align: start;
  max-width: 300px;
`

const Title = styled.h1`
  font-size: 24px;
`
const RecordNote = styled.p`
  font-size: 16px;
`
const Input = ({}) => {
  const [record, setRecords] = useState([])
  const getImage = async () => {
    try {
      const response = await fetch('http://localhost:5000/orders')
      const data = await response.json()
      const recordData = Object.keys(data).map((key) => data[key])
      setRecords(recordData)
      return data
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
      <InputContainer>
        {record?.map((record) => (
          <ImageContainer key={record.id}>
            <Image src={record.recipe.illustrate} alt='Dinosaur' />
            <Title>{record.recipe.title}</Title>
            <RecordNote>{record.recipe.notes}</RecordNote>
          </ImageContainer>
        ))}
      </InputContainer>
    </div>
  )
}

export default Input
