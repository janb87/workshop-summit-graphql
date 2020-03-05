import { queryType, stringArg, idArg, objectType, mutationType, inputObjectType, arg, enumType } from 'nexus'
import { USERS, UserRoles } from './db/users'

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
            resolve: () => {
                return USERS
            }
        }),
        t.field('user', {
            type: 'User',
            nullable: true,
            args: {
                id: idArg({ required: true })
            },
            resolve: (_, { id }) => {
                return USERS.find(user => user.id === id)
            }
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
        t.id('id'),
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
            resolve: (_, { data }) => {
                const newUser = {
                    ...data,
                    role: UserRoles.Visitor,
                    id: (USERS.length + 1).toString()
                }
                USERS.push(newUser)
                return newUser
            }
        })
    }
})

export const UserSchemas = [User, NewUser, UserRole, Query, Mutation]