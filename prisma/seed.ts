/**
 * TNP Tracker — Seed Script
 * Seeds real RGIPT users with random generated passwords.
 * Passwords are printed to console after seeding so they can be shared
 * securely. Every user can change their password from Settings → Profile.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check your .env file.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────
function generatePassword(length = 12): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length }, () =>
    chars[randomBytes(1)[0] % chars.length]
  ).join("");
}

async function upsertUser(data: {
  name: string;
  email: string;
  role: "ADMIN" | "CDC_CHAIRMAN" | "CDC_HEAD" | "FACULTY_COORDINATOR" | "STUDENT_COORDINATOR";
  department?: string;
  year?: number;
  plainPassword: string;
}) {
  const { plainPassword, ...rest } = data;
  const password = await bcrypt.hash(plainPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: rest.email },
    update: { name: rest.name, role: rest.role, department: rest.department },
    create: { ...rest, password, isActive: true },
  });

  return user;
}

// ─── User definitions ───────────────────────────────────
async function main() {
  console.log("🌱  Seeding TNP Tracker — RGIPT...\n");

  // Collect plain passwords to print at the end
  const credentials: { name: string; email: string; role: string; password: string }[] = [];

  // ── Admin ──────────────────────────────────────────────
  const adminPwd = generatePassword();
  await upsertUser({
    name: "Nakshatra Joshi",
    email: "23cd3025@rgipt.ac.in",
    role: "ADMIN",
    department: "CD",
    year: 3,
    plainPassword: adminPwd,
  });
  credentials.push({ name: "Nakshatra Joshi", email: "23cd3025@rgipt.ac.in", role: "Admin", password: adminPwd });

  // ── CDC Chairman ───────────────────────────────────────
  const chairmanPwd = generatePassword();
  await upsertUser({
    name: "Dr. Jaya Srivastava",
    email: "jsrivastava@rgipt.ac.in",
    role: "CDC_CHAIRMAN",
    department: "Training & Placement",
    plainPassword: chairmanPwd,
  });
  credentials.push({ name: "Dr. Jaya Srivastava", email: "jsrivastava@rgipt.ac.in", role: "CDC Chairman", password: chairmanPwd });

  // ── HOD CSE → CDC Head ────────────────────────────────
  const hodPwd = generatePassword();
  await upsertUser({
    name: "Amit Ranjan",
    email: "aranjan@rgipt.ac.in",
    role: "CDC_HEAD",
    department: "CSE",
    plainPassword: hodPwd,
  });
  credentials.push({ name: "Amit Ranjan", email: "aranjan@rgipt.ac.in", role: "CDC Head (HOD CSE)", password: hodPwd });

  // ── Faculty Coordinator ───────────────────────────────
  const facultyPwd = generatePassword();
  await upsertUser({
    name: "Dr. Akash Yadav",
    email: "akashy@rgipt.ac.in",
    role: "FACULTY_COORDINATOR",
    department: "CSE",
    plainPassword: facultyPwd,
  });
  credentials.push({ name: "Dr. Akash Yadav", email: "akashy@rgipt.ac.in", role: "Faculty Coordinator", password: facultyPwd });

  // ── Student Placement Coordinators ────────────────────
  const students: { name: string; email: string; department: string; year: number }[] = [
    { name: "Divyansh Parashar",  email: "23cd3015@rgipt.ac.in", department: "CD",  year: 3 },
    { name: "Rohan Singh",         email: "23cd3034@rgipt.ac.in", department: "CD",  year: 3 },
    { name: "Ayush Sharma",        email: "23cs2018@rgipt.ac.in", department: "CSE", year: 3 },
    { name: "Maana Ajmera",        email: "23cs2028@rgipt.ac.in", department: "CSE", year: 3 },
    { name: "Arpit Solanki",       email: "23it3012@rgipt.ac.in", department: "IT",  year: 3 },
    { name: "Samarth V",           email: "23it3036@rgipt.ac.in", department: "IT",  year: 3 },
    { name: "Ashish Yadav",        email: "23cs3016@rgipt.ac.in", department: "CSE", year: 3 },
    { name: "Preetish Chand",      email: "23cs3044@rgipt.ac.in", department: "CSE", year: 3 },
    { name: "Harsh Mishra",        email: "23mc3026@rgipt.ac.in", department: "MCA", year: 3 },
    { name: "Anshumaan Tanwar",    email: "23mc3009@rgipt.ac.in", department: "MCA", year: 3 },
    { name: "Vaibhav",             email: "23ev3030@rgipt.ac.in", department: "EV",  year: 3 },
  ];

  for (const s of students) {
    const pwd = generatePassword();
    await upsertUser({ ...s, role: "STUDENT_COORDINATOR", plainPassword: pwd });
    credentials.push({ name: s.name, email: s.email, role: "Student Coordinator", password: pwd });
  }

  console.log("✅  Users seeded:", credentials.length);

  // ─── Print credentials table ───────────────────────────
  console.log("\n" + "═".repeat(80));
  console.log("  📋  INITIAL LOGIN CREDENTIALS  (share securely — users must change on login)");
  console.log("═".repeat(80));

  const colW = { name: 24, email: 30, role: 22, pass: 14 };
  const header =
    "  " +
    "Name".padEnd(colW.name) +
    "Email".padEnd(colW.email) +
    "Role".padEnd(colW.role) +
    "Password";
  console.log(header);
  console.log("  " + "─".repeat(colW.name + colW.email + colW.role + colW.pass + 4));

  for (const c of credentials) {
    console.log(
      "  " +
        c.name.padEnd(colW.name) +
        c.email.padEnd(colW.email) +
        c.role.padEnd(colW.role) +
        c.password
    );
  }

  console.log("═".repeat(80));
  console.log("\n  ⚠️   Save these now. Passwords cannot be recovered — only reset.");
  console.log("  🔑  Each user can change their password: Settings → Change Password\n");

  await pool.end();
}

main().catch((e) => {
  console.error("❌  Seed failed:", e);
  process.exit(1);
});
