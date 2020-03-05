import { makeSchema } from 'nexus'
import { ApolloServer } from 'apollo-server'
import { getUserSchemas } from './user'
import { PrismaClient } from '@prisma/client'
import { initTestData } from './initTestData'

const prisma = new PrismaClient()

const schema = makeSchema({
  types: [...getUserSchemas(prisma)],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/types.ts'
  }
})

async function bootstrap() {
  await initTestData(prisma)
  const server = new ApolloServer({
    schema
  })
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
  })
}
bootstrap()
