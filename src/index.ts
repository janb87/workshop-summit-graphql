import { makeSchema, queryType, mutationType } from 'nexus'
import { ApolloServer } from 'apollo-server'
import { nexusPrismaPlugin } from 'nexus-prisma'
import { PrismaClient } from '@prisma/client'
import { initTestData } from './initTestData'
import postSchemas from './post'
import userSchemas from './user'

export interface Context { 
  prisma: PrismaClient
}

const prisma = new PrismaClient()
const resolveContext: Context = {
  prisma,
}

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
  plugins: [nexusPrismaPlugin()],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/types.ts'
  },
  typegenAutoConfig: {
    sources: [{
      alias: 'prisma',
      source: '@prisma/client'
    }]
  }
})

async function bootstrap() {
  await initTestData(prisma)
  const server = new ApolloServer({
    schema,
    context: resolveContext
  })
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
  })
}
bootstrap()
