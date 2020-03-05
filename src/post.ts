import { objectType, intArg } from 'nexus'
import { PrismaClient } from '@prisma/client'
import { ObjectDefinitionBlock, stringArg, idArg, booleanArg } from 'nexus/dist/core'

export function getPostSchemas(prismaClient: PrismaClient) {
    const Post = objectType({
        name: 'Post',
        definition(t) {
            t.int('id')
            t.string('title')
            t.string('content')
            t.boolean('published')
            t.field('author', {
                type: 'User',
                resolve: parent => {
                    return prismaClient.post.findOne({
                        where: { id: parent.id }
                    }).authorId()
                }
            })
        }
    })

    function queryConfig(t: ObjectDefinitionBlock<"Query">) {
        t.field('posts', {
            type: 'Post',
            list: true,
            args: {
                searchString: stringArg({ nullable: true }),
                published: booleanArg({ nullable: true }),
                authorEmail: stringArg({ nullable: true })
            },
            resolve: (_, { searchString, published, authorEmail }) => {
                return prismaClient.post.findMany({
                    where: {
                        OR: [
                            { title: { contains: searchString } },
                            { content: { contains: searchString } },
                        ],
                        AND: [
                            typeof published === 'boolean'
                                ? { published: { equals: published } }
                                : {},
                            typeof authorEmail === 'string'
                                ? { authorId: { email: authorEmail } }
                                : {},
                        ],
                    },
                })
            }
        })
        t.field('post', {
            type: 'Post',
            nullable: true,
            args: {
                id: intArg({ required: true })
            },
            resolve: (_, { id }) => prismaClient.post.findOne({
                where: {
                    id
                }
            })
        })
    }

    function mutationConfig(t: ObjectDefinitionBlock<"Mutation">) {
        t.field('createDraft', {
            type: 'Post',
            nullable: false,
            args: {
                authorEmail: stringArg({ required: true }),
                content: stringArg({ required: true }),
                title: stringArg({ required: true }),
            },
            resolve: async (_, { authorEmail, content, title }) => {
                return prismaClient.post.create({
                    data: {
                        authorId: { connect: { email: authorEmail } },
                        content: content,
                        title: title,
                        published: false
                    }
                })
            }
        })
        t.field('publish', {
            type: 'Post',
            nullable: false,
            args: {
                postId: intArg({ required: true })
            },
            resolve: async (_, { postId }) => {
                return prismaClient.post.update({
                    where: {
                        id: postId,
                    },
                    data: {
                        published: true
                    }
                })
            }
        })
    }

    return {
        query: queryConfig,
        mutation: mutationConfig,
        schemas: [Post]
    }
}

