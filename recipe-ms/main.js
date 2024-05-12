const path = require('path')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, '../protos/recipes.proto')
)
const recipesProto = grpc.loadPackageDefinition(packageDefinition)
const AWS = require('aws-sdk')
require('dotenv').config({ path: __dirname + '/.env' })

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const dynamoClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = 'demo'

const RECIPES = [
  {
    id: 100,
    productId: 1000,
    title: 'Pizza',
    notes: 'See video: pizza_recipe.mp4. Use oven No. 12',
    illustrate: ''
  },
  {
    id: 200,
    productId: 2000,
    title: 'Lasagna',
    notes: 'Ask from John. Use any oven, but make sure to pre-heat it!',
    illustrate: ''
  }
]

function findRecipe(call, callback) {
  const recipe = RECIPES.find((recipe) => recipe.productId == call.request.id)
  if (recipe) {
    callback(null, recipe)
  } else {
    callback({
      message: 'Recipe not found',
      code: grpc.status.INVALID_ARGUMENT
    })
  }
}

const server = new grpc.Server()
server.addService(recipesProto.Recipes.service, { find: findRecipe })
server.bindAsync(
  '0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start()
  }
)
