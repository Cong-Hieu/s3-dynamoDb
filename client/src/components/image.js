import React from 'react'

function Image(props) {
  return props.images.map((image, index) => <img src={image} alt='Dinosaur' />)
}

export default Image
