
export enum UserRoles {
    Admin = 'admin',
    Visitor = 'visitor'
}

export const USERS = [{
    id: "1",
    name: "Alice",
    email: "alice@prisma.io",
    role: UserRoles.Visitor
}, {
    id: "2",
    name: "Bob",
    email: "bob@prisma.io",
    role: UserRoles.Admin
}]