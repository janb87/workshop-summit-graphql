import { PrismaClient } from '@prisma/client'
import { ObjectDefinitionBlock } from 'nexus/dist/core'
import { stringArg, intArg, enumType, objectType, inputObjectType, arg } from 'nexus'
import { UserRoles } from './test-data/users'

export function getUserSchemas(prismaClient: PrismaClient) {
    function queryConfig(t: ObjectDefinitionBlock<"Query">) {
        t.field('hello', {
            type: 'String',
            args: {
                name: stringArg()
            },
            resolve: (_, args) => `Hello ${args.name || 'Nexus'}`
        })
        t.field('users', {
            type: 'User',
            list: true,
            nullable: true,
            resolve: () => prismaClient.user.findMany()
        })
        t.field('user', {
            type: 'User',
            nullable: true,
            args: {
                id: intArg({ required: true })
            },
            resolve: (_, { id }) => prismaClient.user.findOne({
                where: {
                    id
                }
            })
        })
    }

    const UserRole = enumType({
        name: 'UserRole',
        members: UserRoles
    })

    const User = objectType({
        name: 'User',
        definition(t) {
            t.int('id')
            t.string('email')
            t.string('name')
            t.field('role', {
                type: 'UserRole',
                nullable: true
            })
        }
    })

    const NewUser = inputObjectType({
        name: 'NewUser',
        definition(t) {
            t.string('email', { required: true })
            t.string('name', { required: true })
            t.field('role', {
                type: 'UserRole',
                required: true
            })
        }
    })

    function mutationConfig(t: ObjectDefinitionBlock<"Mutation">) {
        t.field('signupUser', {
            type: 'User',
            nullable: false,
            args: {
                data: arg({ type: 'NewUser' })
            },
            resolve: (_, { data }) => prismaClient.user.create({ data })
        })
    }

    return {
        query: queryConfig,
        mutation: mutationConfig,
        schemas: [User, NewUser, UserRole]
    }
}
