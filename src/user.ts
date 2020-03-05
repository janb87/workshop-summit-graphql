import { ObjectDefinitionBlock } from 'nexus/dist/core'
import { stringArg, intArg, enumType, objectType, inputObjectType, arg } from 'nexus'
import { UserRoles } from './test-data/users'
import { Context } from '.'

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
        resolve: (_, args, { prisma }: Context) => prisma.user.findMany()
    })
    t.field('user', {
        type: 'User',
        nullable: true,
        args: {
            id: intArg({ required: true })
        },
        resolve: (_, { id }, { prisma }: Context) => prisma.user.findOne({
            where: {
                id
            }
        })
    })
    t.crud.users()
}

const UserRole = enumType({
    name: 'UserRole',
    members: UserRoles
})

const User = objectType({
    name: 'User',
    definition(t) {
        t.model.id()
        t.model.name()
        t.model.email()
        t.model.role()
        t.model.posts()
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
    t.crud.deleteOneUser({ alias: 'deleteUser' })

    t.field('signupUser', {
        type: 'User',
        nullable: false,
        args: {
            data: arg({ type: 'NewUser' })
        },
        resolve: (_, { data }, { prisma }: Context) => prisma.user.create({ data })
    })
}

export default {
    query: queryConfig,
    mutation: mutationConfig,
    schemas: [User, NewUser, UserRole]
}

