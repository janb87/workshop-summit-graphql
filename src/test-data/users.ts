
export enum UserRoles {
    Admin = 'admin',
    Visitor = 'visitor'
}

export const USERS = [{
    name: "Alice",
    email: "alice@prisma.io",
    role: UserRoles.Visitor
}, {
    name: "Bob",
    email: "bob@prisma.io",
    role: UserRoles.Admin
}]