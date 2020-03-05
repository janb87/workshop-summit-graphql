import { objectType, intArg } from 'nexus'
import { ObjectDefinitionBlock, stringArg, booleanArg } from 'nexus/dist/core'
import { Context } from '.'

const Category = objectType({
    name: 'Category',
    definition(t) {
        t.model.id()
        t.model.name()
        t.model.owner()
    }
})

function queryConfig(t: ObjectDefinitionBlock<"Query">) {
    t.crud.categories({
        filtering: true,
        pagination: true,
        ordering: true,
        type: 'Category'
    })

    t.crud.category()
}

function mutationConfig(t: ObjectDefinitionBlock<"Mutation">) {
    t.crud.createOneCategory({ alias: 'createCategory' })
}

export default {
    query: queryConfig,
    mutation: mutationConfig,
    schemas: [Category]
}


