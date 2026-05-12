/**
 * TNP Tracker — Seed Script
 * Seeds company records (contacts, activities, status logs).
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check your .env file.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Company seed data ──────────────────────────────────

const COMPANIES_TO_SEED = [
  {
    companyName: "Yotta Data Services Pvt. Ltd.",
    domain: "yotta.com",
    website: "https://yotta.com",
    companyType: "OTHER" as const,          // Data Center / Cloud
    industry: "Cloud & Data Center",
    country: "India",
    currentStatus: "COLD_EMAIL_SENT" as const,
    notes: null,
    contacts: [
      { name: "Sonu Gupta", email: "sonug@yotta.com", phone: null, designation: null, isPrimary: true },
    ],
    mailedAt: new Date("2026-04-18T00:00:00+05:30"),
    followUp: null,
  },
  {
    companyName: "Alphadroid",
    domain: "alphadroid.io",
    website: "https://alphadroid.io",
    companyType: "STARTUP" as const,
    industry: "Technology",
    country: "India",
    currentStatus: "FOLLOWUP_DONE" as const,
    notes: null,
    contacts: [
      { name: "Priyanka Khanna", email: "priyanka.khanna@alphadroid.io", phone: null, designation: null, isPrimary: true },
    ],
    mailedAt: new Date("2026-04-18T00:00:00+05:30"),
    followUp: {
      sentAt: new Date("2026-05-12T00:00:00+05:30"),
      summary: "2nd follow-up email sent to Priyanka Khanna regarding campus placement drive.",
    },
  },
  {
    companyName: "Tekdi Technologies",
    domain: "tekditechnologies.com",
    website: "https://tekditechnologies.com",
    companyType: "PRODUCT" as const,
    industry: "Technology",
    country: "India",
    currentStatus: "COLD_EMAIL_SENT" as const,
    notes: null,
    contacts: [
      { name: "Vishal C", email: "vishal_c@tekditechnologies.com", phone: null, designation: null, isPrimary: true },
    ],
    mailedAt: new Date("2026-04-18T00:00:00+05:30"),
    followUp: null,
  },
  {
    companyName: "DeepTek",
    domain: "deeptek.ai",
    website: "https://deeptek.ai",
    companyType: "HEALTHTECH" as const,
    industry: "AI / HealthTech",
    country: "India",
    currentStatus: "COLD_EMAIL_SENT" as const,
    notes: null,
    contacts: [
      { name: "Ritika Taki", email: "ritika.taki@deeptek.ai", phone: null, designation: null, isPrimary: true },
    ],
    mailedAt: new Date("2026-04-18T00:00:00+05:30"),
    followUp: null,
  },
  {
    companyName: "eka.care",
    domain: "eka.care",
    website: "https://eka.care",
    companyType: "HEALTHTECH" as const,
    industry: "HealthTech",
    country: "India",
    currentStatus: "COLD_EMAIL_SENT" as const,
    notes: null,
    contacts: [
      { name: "Raghunandan", email: "rags@eka.care", phone: null, designation: null, isPrimary: true },
    ],
    mailedAt: new Date("2026-05-12T00:00:00+05:30"),
    followUp: null,
  },
  {
    companyName: "Biz-Tech Analytics",
    domain: "biztechanalytics.com",
    website: "https://biztechanalytics.com",
    companyType: "STARTUP" as const,
    industry: "Analytics & Business Intelligence",
    country: "India",
    currentStatus: "COLD_EMAIL_SENT" as const,
    notes: "Openings: Full Stack Developer, AI Automation Engineer.",
    contacts: [
      {
        name: "Palak Kalra",
        email: "founders.office@biztechanalytics.com",
        phone: "9220798787",
        designation: "Founder's Office",
        isPrimary: true,
      },
    ],
    mailedAt: new Date("2026-05-12T00:00:00+05:30"),
    followUp: null,
  },
  {
    companyName: "OnFinance AI",
    domain: "onfinance.in",
    website: "https://onfinance.in",
    companyType: "FINTECH" as const,
    industry: "FinTech / AI",
    country: "India",
    currentStatus: "COLD_EMAIL_SENT" as const,
    notes: "Openings: Full Stack Developer, AI Automation Engineer.",
    contacts: [
      { name: "Ananya",  email: "Ananya@onfinance.in",  phone: null, designation: null, isPrimary: true  },
      { name: "Sanjana", email: "sanjana@onfinance.in", phone: null, designation: null, isPrimary: false },
    ],
    mailedAt: new Date("2026-05-12T00:00:00+05:30"),
    followUp: null,
  },
];

async function seedCompanies(prisma: PrismaClient) {
  console.log("🏢  Seeding companies...\n");

  // Use the admin as the system actor for seeded records
  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: "23cd3025@rgipt.ac.in" },
  });

  let seeded = 0;

  for (const c of COMPANIES_TO_SEED) {
    // Idempotent: skip if already exists
    const existing = await prisma.company.findFirst({
      where: { companyName: c.companyName, isDeleted: false },
    });

    const company = existing
      ? existing
      : await prisma.company.create({
          data: {
            companyName: c.companyName,
            domain: c.domain,
            website: c.website,
            companyType: c.companyType,
            industry: c.industry,
            country: c.country,
            currentStatus: c.currentStatus,
            notes: c.notes,
            createdById: admin.id,
          },
        });

    if (!existing) {
      const primaryContact = c.contacts.find((ct) => ct.isPrimary) ?? c.contacts[0];

      // Status log
      await prisma.companyStatusLog.create({
        data: {
          companyId: company.id,
          oldStatus: null,
          newStatus: "COLD_EMAIL_SENT",
          notes: `Initial cold email sent to ${primaryContact.name} (${primaryContact.email}) on ${c.mailedAt.toDateString()}.`,
          changedAt: c.mailedAt,
          changedById: admin.id,
        },
      });

      // All contacts
      for (const ct of c.contacts) {
        await prisma.contact.create({
          data: {
            companyId: company.id,
            name: ct.name,
            email: ct.email,
            phone: ct.phone,
            designation: ct.designation,
            isPrimary: ct.isPrimary,
          },
        });
      }

      // Cold-email activity
      const contactList = c.contacts.map((ct) => `${ct.name} <${ct.email}>`).join(", ");
      await prisma.activity.create({
        data: {
          companyId: company.id,
          type: "EMAIL",
          summary: `Cold email sent to ${contactList}.`,
          notes: `First outreach email to explore campus placement / internship opportunities at RGIPT.`,
          createdAt: c.mailedAt,
          createdById: admin.id,
        },
      });
    }

    // Follow-up activity (e.g. Alphadroid — 2nd mail)
    if (c.followUp) {
      const alreadyFollowedUp = await prisma.activity.findFirst({
        where: {
          companyId: company.id,
          type: "FOLLOWUP",
          createdAt: { gte: c.followUp.sentAt },
        },
      });

      if (!alreadyFollowedUp) {
        await prisma.activity.create({
          data: {
            companyId: company.id,
            type: "FOLLOWUP",
            summary: c.followUp.summary,
            notes: "2nd follow-up email as part of outreach campaign.",
            createdAt: c.followUp.sentAt,
            createdById: admin.id,
          },
        });

        await prisma.companyStatusLog.create({
          data: {
            companyId: company.id,
            oldStatus: "COLD_EMAIL_SENT",
            newStatus: "FOLLOWUP_DONE",
            notes: "Second follow-up mail sent on 12th May 2026.",
            changedAt: c.followUp.sentAt,
            changedById: admin.id,
          },
        });

        await prisma.company.update({
          where: { id: company.id },
          data: { currentStatus: "FOLLOWUP_DONE" },
        });
      }
    }

    seeded++;
    console.log(`  ✅  ${c.companyName} (${c.contacts.length} contact${c.contacts.length > 1 ? "s" : ""})`);
  }

  console.log(`\n✅  Companies seeded: ${seeded}`);
}

async function main() {
  await seedCompanies(prisma);
  await pool.end();
}

main().catch((e) => {
  console.error("❌  Seed failed:", e);
  process.exit(1);
});
