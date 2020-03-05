import { objectType, intArg } from 'nexus'
import { ObjectDefinitionBlock, stringArg, booleanArg } from 'nexus/dist/core'
import { Context } from '.'

const Post = objectType({
    name: 'Post',
    definition(t) {
        t.model.id()
        t.model.title()
        t.model.content()
        t.model.published()
        t.model.authorId({ alias: 'author' })
        t.model.categories()
    }
})

function queryConfig(t: ObjectDefinitionBlock<"Query">) {
    t.crud.posts({
        /*filtering: {
            authorId: false,
            published: true,
            AND: true,
            OR: true,
        },*/
        filtering: true,
        pagination: true,
        ordering: true,
    })

    t.field('filterPosts', {
        type: 'Post',
        list: true,
        args: {
            searchString: stringArg({ nullable: true }),
            published: booleanArg({ nullable: true }),
            authorEmail: stringArg({ nullable: true })
        },
        resolve: (_, { searchString, published, authorEmail }, { prisma }: Context) => {
            return prisma.post.findMany({
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
        resolve: (_, { id }, { prisma }: Context) => prisma.post.findOne({
            where: {
                id
            }
        })
    })
}

function mutationConfig(t: ObjectDefinitionBlock<"Mutation">) {
    t.crud.deleteOnePost({ alias: 'deletePost' })
    t.field('createDraft', {
        type: 'Post',
        nullable: false,
        args: {
            authorEmail: stringArg({ required: true }),
            content: stringArg({ required: true }),
            title: stringArg({ required: true }),
            categoryIds: intArg({ required: true, list: true }),
        },
        resolve: async (_, { authorEmail, content, title, categoryIds }, { prisma }: Context) => {
            return prisma.post.create({
                data: {
                    authorId: { connect: { email: authorEmail } },
                    content: content,
                    title: title,
                    published: false,
                    categories: {
                        connect: categoryIds.map(cat => ({ id: cat }))
                    },
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
        resolve: (_, { postId }, { prisma }: Context) => {
            return prisma.post.update({
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

export default {
    query: queryConfig,
    mutation: mutationConfig,
    schemas: [Post]
}


