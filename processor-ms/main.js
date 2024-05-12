const path = require('path')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
require('dotenv').config({ path: __dirname + '/.env' })
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, '../protos/processing.proto')
)
const processingProto = grpc.loadPackageDefinition(packageDefinition)

const AWS = require('aws-sdk')

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIAWORLX2ZOW7JTXDWG',
  secretAccessKey: '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'
})
const s3 = new AWS.S3({
  Bucket: 's3-demo222'
})

function process(call) {
  const orderRequest = call.request
  const time = orderRequest.orderId * 1000 + orderRequest.recipeId * 10

  call.write({ status: 2 })
  setTimeout(() => {
    call.write({ status: 3 })
    setTimeout(() => {
      call.write({ status: 4 })
      call.end()
    }, time)
  }, time)
}

const server = new grpc.Server()
server.addService(processingProto.Processing.service, { process })
server.bindAsync(
  '0.0.0.0:50052',
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start()
  }
)
