const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixOwnerMembership() {
  try {
    // Récupérer tous les groupes
    const groups = await prisma.group.findMany({
      include: { members: true }
    });

    console.log(`Trouvé ${groups.length} groupe(s)`);

    for (const group of groups) {
      // Vérifier si l'owner est déjà membre
      const ownerIsMember = group.members.some(m => m.userId === group.ownerId);

      if (!ownerIsMember) {
        console.log(`➜ Ajout de l'owner au groupe: "${group.name}" (ID: ${group.id})`);
        await prisma.groupMember.create({
          data: {
            userId: group.ownerId,
            groupId: group.id,
          }
        });
        console.log(`  ✓ Owner ajouté avec succès`);
      } else {
        console.log(`✓ Groupe "${group.name}" - owner déjà membre (${group.members.length} membre(s))`);
      }
    }

    console.log('\n✅ Terminé!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixOwnerMembership();
