require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
async function main() {
    const alice = await prisma.user.create({
        data: {
            email: 'correctyyyy@gmail.com',
            username: 'Pratigya Dhakal',
            password: await bcrypt.hash('123456', 10),
            role: 'ADMIN',
            status: 'ACTIVE',
            verify: 'VERIFIED',

        },
    })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
