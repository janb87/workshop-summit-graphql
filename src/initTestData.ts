import { USERS } from './test-data/users'
import { PrismaClient } from '@prisma/client';

export async function initTestData(prismaClient: PrismaClient) {
    const existingUsers = await prismaClient.user.findMany()
    const existingEmails = existingUsers.map(user => user.email)
    await Promise.all(USERS.map(user => {
        if (!existingEmails.includes(user.email)) {
            return prismaClient.user.create({ data: user })
        }
        console.log(`User ${user.email} is already imported`)
        return
    }))
}