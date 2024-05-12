const path = require('path')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const express = require('express')
const cors = require('cors')

const packageDefinitionReci = protoLoader.loadSync(
  path.join(__dirname, '../protos/recipes.proto')
)
const packageDefinitionProc = protoLoader.loadSync(
  path.join(__dirname, '../protos/processing.proto')
)
const recipesProto = grpc.loadPackageDefinition(packageDefinitionReci)
const processingProto = grpc.loadPackageDefinition(packageDefinitionProc)

const recipesStub = new recipesProto.Recipes(
  '0.0.0.0:50051',
  grpc.credentials.createInsecure()
)
const processingStub = new processingProto.Processing(
  '0.0.0.0:50052',
  grpc.credentials.createInsecure()
)

const app = express()
app.use(express.json())
app.use(cors())
const restPort = 5000
const orders = {
  1: {
    id: 1,
    status: 3,
    productId: 1000,
    createdAt: '16:41:34, 12/5/2024',
    recipe: {
      id: 100,
      title: 'Pizza',
      notes: 'See video: pizza_recipe.mp4. Use oven No. 12',
      illustrate: ''
    }
  },
  2: {
    id: 2,
    status: 2,
    productId: 2000,
    createdAt: '16:41:37, 12/5/2024',
    recipe: {
      id: 200,
      title: 'Lasagna',
      notes: 'Ask from John. Use any oven, but make sure to pre-heat it!',
      illustrate: ''
    }
  }
}

function processAsync(order) {
  recipesStub.find({ id: order.productId }, (err, recipe) => {
    if (err) return

    orders[order.id].recipe = recipe
    const call = processingStub.process({
      orderId: order.id,
      recipeId: recipe.id
    })
    call.on('data', (statusUpdate) => {
      orders[order.id].status = statusUpdate.status
    })
  })
}

app.post('/orders', (req, res) => {
  if (!req.body.productId) {
    res.status(400).send('Product identifier is not set')
    return
  }
  const orderId = Object.keys(orders).length + 1
  const order = {
    id: orderId,
    status: 0,
    productId: req.body.productId,
    createdAt: new Date().toLocaleString()
  }
  orders[order.id] = order
  processAsync(order)
  res.send(order)
})

app.get('/orders', async (req, res) => {
  const getIllustrateOrders = new Promise((resolve, reject) => {
    let count = 0
    Object.keys(orders).forEach(function (key) {
      const order = orders[key]
      recipesStub.getIllustrate({ id: order.productId }, (err, illustrate) => {
        orders[key].recipe.illustrate = illustrate?.name
        count++
        if (count === Object.keys(orders).length) resolve()
      })
    })
  })

  getIllustrateOrders?.then(() => {
    console.log('All done!')
    res.status(200).send(orders)
  })
})

app.get('/orders/:id', (req, res) => {
  if (!req.params.id) {
    res.status(400).send('Order not found')
    return
  }
  console.log(orders[req.params.id])
  res.status(200).send({ data: orders[req.params.id] })
})

app.listen(restPort, () => {
  console.log(`RESTful API is listening on port ${restPort}`)
})
