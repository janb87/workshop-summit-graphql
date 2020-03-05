import { makeSchema, queryType, mutationType } from 'nexus'
import { ApolloServer } from 'apollo-server'
import { getUserSchemas } from './user'
import { PrismaClient } from '@prisma/client'
import { initTestData } from './initTestData'
import { getPostSchemas } from './post'

const prisma = new PrismaClient()

const userSchemas = getUserSchemas(prisma)
const postSchemas = getPostSchemas(prisma)
const Query =
  queryType({
    definition(t) {
      userSchemas.query(t)
      postSchemas.query(t)
    }
  })

const Mutation =
  mutationType({
    definition(t) {
      userSchemas.mutation(t)
      postSchemas.mutation(t)
    }
  })

const schema = makeSchema({
  types: [Query, Mutation, ...userSchemas.schemas, ...postSchemas.schemas],
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
