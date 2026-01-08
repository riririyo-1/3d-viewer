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
  const storagePath = `${testUser.id}/seed/FlexiSpot_cherryblossom.glb`;

  // 既存のアセットを検索
  let asset = await prisma.asset.findUnique({
    where: { storagePath },
  });

  // 存在しない場合は作成
  if (!asset) {
    asset = await prisma.asset.create({
      data: {
        userId: testUser.id,
        name: 'FlexiSpot cherryblossom',
        type: 'glb',
        size: BigInt(5000000), // 仮のサイズ
        storagePath,
        thumbnailUrl: null,
      },
    });
    console.log('✓ Test asset created:', asset.name);
  } else {
    console.log('✓ Test asset already exists:', asset.name);
  }

  // -- ライブラリモデル作成 --------------
  // Note: frontend/public/glb/FlexiSpot_cherryblossom.glb を参照
  await prisma.libraryModel.upsert({
    where: { id: 'flexispot-cherry' },
    update: {},
    create: {
      id: 'flexispot-cherry',
      name: 'FlexiSpot cherryblossom',
      category: 'glb',
      url: '/glb/FlexiSpot_cherryblossom.glb', // frontend/public配下のパス
      thumbnailUrl: null,
      description: 'FlexiSpot standing desk with cherryblossom design',
      size: BigInt(5000000), // 仮のサイズ
    },
  });

  console.log('✓ Library model created');

  // -- 閲覧履歴作成(テスト用) --------------
  // 既存の履歴を検索(ユーザーとアセットの組み合わせで)
  let history = await prisma.recentHistory.findFirst({
    where: {
      userId: testUser.id,
      assetId: asset.id,
    },
  });

  // 存在しない場合は作成
  if (!history) {
    history = await prisma.recentHistory.create({
      data: {
        userId: testUser.id,
        assetId: asset.id,
        lastOpenedAt: new Date(),
      },
    });
    console.log('✓ Recent history created');
  } else {
    console.log('✓ Recent history already exists');
  }

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
