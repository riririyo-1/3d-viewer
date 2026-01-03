import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();


async function main() {
  console.log('Starting seed...');

  // -- テストユーザー作成 --------------
  const hashedPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      plan: 'free',
      storageLimit: BigInt(1073741824), // 1GB
    },
  });

  console.log('✓ Test user created:', testUser.email);

  // -- 初期アセット作成 --------------
  // Note: 実際のファイルはfrontend/public/glb/FlexiSpot_cherryblossom.glbにあるため
  // MinIOへのアップロードは手動またはアプリ経由で行う必要があります
  const asset = await prisma.asset.upsert({
    where: { id: 'seed-asset-flexispot-1' },
    update: {},
    create: {
      id: 'seed-asset-flexispot-1',
      userId: testUser.id,
      name: 'FlexiSpot cherryblossom',
      type: 'glb',
      size: BigInt(5000000), // 仮のサイズ
      storagePath: `${testUser.id}/seed/FlexiSpot_cherryblossom.glb`,
      thumbnailUrl: null,
    },
  });

  console.log('✓ Test asset created:', asset.name);

  // -- ライブラリモデル作成 --------------
  await prisma.libraryModel.upsert({
    where: { id: 'seed-library-flexispot-1' },
    update: {},
    create: {
      id: 'seed-library-flexispot-1',
      userId: testUser.id,
      assetId: asset.id,
      category: 'furniture',
      tags: ['desk', 'office', 'flexispot'],
    },
  });

  console.log('✓ Library model created');

  console.log('Seed completed successfully!');
}


main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
