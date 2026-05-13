import { prisma } from './src/lib/prisma';

async function main() {
  try {
    console.log('Testing with {}...');
    const count1 = await prisma.product.count({});
    console.log('Count Success:', count1);
    const find1 = await prisma.product.findMany({ take: 1, orderBy: { createdAt: 'desc' } });
    console.log('FindMany Success:', find1.length);

    console.log('\nTesting with { where: undefined }...');
    const count2 = await prisma.product.count({ where: undefined });
    console.log('Count (undefined) Success:', count2);
    const find2 = await prisma.product.findMany({ where: undefined, take: 1, orderBy: { createdAt: 'desc' } });
    console.log('FindMany (undefined) Success:', find2.length);
  } catch (error) {
    console.error('FAILURE DETECTED');
    console.error(error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('OUTER FAILURE');
  console.error(err);
  process.exit(1);
});
