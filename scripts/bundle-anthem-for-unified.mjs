#!/usr/bin/env node
/**
 * Bundle Anthem migrations into unified SQL with schema prefixes.
 * Output: supabase/migrations/20260606130000_anthem_schema_bundle.sql (generated section)
 * and supabase/manual/apply-anthem-ecosystem.sql for one-shot Dashboard apply.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const anthemMigrations = join(root, "..", "Anthem-Code", "supabase", "migrations");
const outManual = join(root, "supabase", "manual", "apply-anthem-ecosystem.sql");

const SHARED_TABLES = new Set([
  "wallets",
  "wallet_topups",
  "cashout_requests",
  "gifts",
  "gift_transactions",
  "gift_limits_config",
  "contracts",
  "admin_audit_log",
  "conversations",
  "messages",
  "aml_flags",
  "kyc_requests",
]);

const SKIP_CREATE = new Set([
  "profiles",
  "user_roles",
  "subscriptions",
  "user_credits",
  "notifications", // handled separately
]);

const ANTHEM_ENUMS = new Set([
  "app_role",
  "hire_budget",
  "hire_status",
  "job_location_type",
  "job_budget_type",
  "studio_member_role",
]);

function targetSchema(tableName) {
  if (SHARED_TABLES.has(tableName)) return "shared";
  return "anthem";
}

function rewriteSql(sql, fileName) {
  let out = sql;

  // Skip duplicate schema bootstrap from anthem (we ship our own)
  if (fileName.includes("20260530055218")) {
    return "-- skipped (schemas created in 20260606120000_ecosystem_schemas.sql)\n";
  }

  // Skip seed migrations in bundle (run separately)
  if (fileName.includes("seed_") || fileName.includes("20260604130100")) {
    return `-- skipped seed migration ${fileName}\n`;
  }

  // Skip unified subscription create if tables exist — handled in merge migration
  if (fileName.includes("20260604120000_unified_ecosystem")) {
    return `-- skipped ${fileName} (subscription merge in 20260606120100)\n`;
  }

  // shared.notifications block — handled in 20260606120200
  if (fileName.includes("20260530055442")) {
    return `-- skipped ${fileName} (notifications in 20260606120200)\n`;
  }

  // Skip CREATE TABLE for overlapping identity tables
  for (const t of SKIP_CREATE) {
    out = out.replace(
      new RegExp(`CREATE TABLE (?:IF NOT EXISTS )?public\\.${t}\\b`, "gi"),
      `-- SKIP CREATE public.${t} (unified)\n-- CREATE TABLE public.${t}`,
    );
  }

  // Rewrite CREATE TABLE public.X → schema.X
  out = out.replace(
    /CREATE TABLE (IF NOT EXISTS )?public\.([a-z_][a-z0-9_]*)/gi,
    (_, ifNot, table) => {
      if (SKIP_CREATE.has(table)) {
        return `-- SKIP CREATE public.${table}\n-- CREATE TABLE public.${table}`;
      }
      const schema = targetSchema(table);
      return `CREATE TABLE ${ifNot || ""}${schema}.${table}`;
    },
  );

  // ALTER TABLE public.X → schema.X (for non-skip tables)
  out = out.replace(/ALTER TABLE public\.([a-z_][a-z0-9_]*)/gi, (_, table) => {
    if (SKIP_CREATE.has(table)) return `ALTER TABLE public.${table}`;
    if (SHARED_TABLES.has(table)) return `ALTER TABLE shared.${table}`;
    if (ANTHEM_ENUMS.has(table)) return `ALTER TABLE public.${table}`;
    return `ALTER TABLE anthem.${table}`;
  });

  // Policies / indexes on anthem & shared tables
  out = out.replace(/ON public\.([a-z_][a-z0-9_]*)/gi, (_, table) => {
    if (SKIP_CREATE.has(table) || table === "notifications") return `ON public.${table}`;
    if (SHARED_TABLES.has(table)) return `ON shared.${table}`;
    return `ON anthem.${table}`;
  });

  // FK references to anthem/shared tables
  for (const t of [...SHARED_TABLES]) {
    out = out.replaceAll(`REFERENCES public.${t}`, `REFERENCES shared.${t}`);
  }

  // Keep public.profiles / public.user_roles references in FKs
  out = out.replace(/REFERENCES public\.profiles/g, "REFERENCES public.profiles");
  out = out.replace(/REFERENCES public\.user_roles/g, "REFERENCES public.user_roles");

  // anthem table FKs to profiles still use auth.users or public.profiles
  const anthemTables = [
    "projects",
    "project_likes",
    "project_comments",
    "studios",
    "job_posts",
    "hiring_requests",
    "collab_requests",
    "follows",
    "collections",
    "inspire_boards",
    "ad_campaigns",
  ];
  for (const t of anthemTables) {
    out = out.replaceAll(`REFERENCES public.${t}`, `REFERENCES anthem.${t}`);
  }

  // ENUMs stay in public (shared by all schemas)
  out = out.replace(/CREATE TYPE anthem\./gi, "CREATE TYPE public.");
  out = out.replace(/::public\./g, "::public.");

  // Functions referencing anthem tables — set search_path
  out = out.replace(
    /SET search_path = public/gi,
    "SET search_path = anthem, shared, public",
  );

  return out;
}

const files = readdirSync(anthemMigrations)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const parts = [
  "-- Anthem → unified project rvnzjiskqliexysicfmh",
  `-- Generated: ${new Date().toISOString()}`,
  "-- Run AFTER 20260606120000 + 20260606120100 + 20260606120200",
  "-- Dashboard SQL Editor or: ./scripts/supabase-push-via-api.sh",
  "",
];

for (const f of files) {
  const raw = readFileSync(join(anthemMigrations, f), "utf8");
  parts.push(`-- ── ${f} ──`);
  parts.push(rewriteSql(raw, f));
  parts.push("");
}

writeFileSync(outManual, parts.join("\n"));
console.log(`Wrote ${outManual} (${files.length} source files)`);
