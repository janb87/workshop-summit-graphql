import { queryType, stringArg, idArg, objectType, mutationType, inputObjectType, arg, enumType, intArg } from 'nexus'
import { USERS, UserRoles } from './test-data/users'
import { PrismaClient } from '@prisma/client'

export function getUserSchemas(prismaClient: PrismaClient) {
    const Query = queryType({
        definition(t) {
            t.field('hello', {
                type: 'String',
                args: {
                    name: stringArg()
                },
                resolve: (_, args) => `Hello ${args.name || 'Nexus'}`
            }),
            t.field('users', {
                type: 'User',
                list: true,
                nullable: true,
                resolve: () => prismaClient.user.findMany()
            }),
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
    })

    const UserRole = enumType({
        name: 'UserRole',
        members: UserRoles
    })

    const User = objectType({
        name: 'User',
        definition(t) {
            t.int('id'),
            t.string('email'),
            t.string('name'),
            t.field('role', {
                type: 'UserRole',
                nullable: true
            })
        }
    })

    const NewUser = inputObjectType({
        name: 'NewUser',
        definition(t) {
            t.string('email', { required: true }),
            t.string('name', { required: true })
            t.field('role', {
                type: 'UserRole',
                required: true
            })
        }
    })

    const Mutation = mutationType({
        definition(t) {
            t.field('signupUser', {
                type: 'User',
                nullable: false,
                args: {
                    data: arg({ type: 'NewUser' })
                },
                resolve: (_, { data }) => prismaClient.user.create({ data })
            })
        }
    })

    return [User, NewUser, UserRole, Query, Mutation]
}
