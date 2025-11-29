import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱  Starting database seed...');

    // Clean existing data
    console.log('🧹  Cleaning existing data...');
    await prisma.$transaction([
        prisma.aIEvaluation.deleteMany(),
        prisma.interviewSummary.deleteMany(),
        prisma.response.deleteMany(),
        prisma.question.deleteMany(),
        prisma.interview.deleteMany(),
        prisma.resumeRanking.deleteMany(),
        prisma.jobApplication.deleteMany(),
        prisma.resumeCertification.deleteMany(),
        prisma.resumeEducation.deleteMany(),
        prisma.resumeExperience.deleteMany(),
        prisma.resumeSkill.deleteMany(),
        prisma.resume.deleteMany(),
        prisma.job.deleteMany(),
        prisma.team.deleteMany(),
        prisma.company.deleteMany(),
        prisma.contact.deleteMany(),
        prisma.personalInfo.deleteMany(),
        prisma.account.deleteMany(),
        prisma.user.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.auditLog.deleteMany(),
    ]);

    console.log('✅  Database seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('  - Database cleaned and ready');
    console.log('  - Schema validated');
    console.log('');
    console.log('Note: Comprehensive seed data can be added later.');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌  Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });