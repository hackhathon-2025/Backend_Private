const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Generate a unique invite code
function generateInviteCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function main() {
    console.log('Starting to generate invite codes for groups without one...');

    // Find all groups without an invite code
    const groupsWithoutCode = await prisma.group.findMany({
        where: {
            inviteCode: null
        }
    });

    console.log(`Found ${groupsWithoutCode.length} groups without invite codes.`);

    for (const group of groupsWithoutCode) {
        let inviteCode = generateInviteCode();
        let codeExists = true;
        let attempts = 0;

        // Ensure the code is unique
        while (codeExists && attempts < 10) {
            const existing = await prisma.group.findUnique({
                where: { inviteCode }
            });
            if (!existing) {
                codeExists = false;
            } else {
                inviteCode = generateInviteCode();
                attempts++;
            }
        }

        if (attempts >= 10) {
            console.error(`Failed to generate unique code for group ${group.id} after 10 attempts`);
            continue;
        }

        // Update the group with the new invite code
        await prisma.group.update({
            where: { id: group.id },
            data: { inviteCode }
        });

        console.log(`Generated invite code ${inviteCode} for group "${group.name}" (${group.id})`);
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
