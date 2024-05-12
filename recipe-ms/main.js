const path = require('path')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, '../protos/recipes.proto')
)
const recipesProto = grpc.loadPackageDefinition(packageDefinition)
const AWS = require('aws-sdk')

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIAWORLX2ZOW7JTXDWG',
  secretAccessKey: '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'
})
const s3 = new AWS.S3({
  Bucket: 's3-demo222'
})
const dynamoClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = 'demo'

const getCharacters = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id.toString()
    }
  }
  const data = await dynamoClient.get(params).promise()
  return data
}

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

const getIllustrate = (call, callback) => {
  const { id } = call.request
  getCharacters(id)
    .then((characters) => {
      const illustrate = characters.Item
      illustrate.name = `https://s3-demo222.s3.amazonaws.com/${illustrate.name}`
      callback(null, illustrate)
    })
    .catch((error) => {
      callback({
        message: 'Illustrate not found',
        code: grpc.status.INVALID_ARGUMENT
      })
    })
}

const server = new grpc.Server()
server.addService(recipesProto.Recipes.service, {
  find: findRecipe,
  getIllustrate: getIllustrate
})
server.bindAsync(
  '0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start()
  }
)
