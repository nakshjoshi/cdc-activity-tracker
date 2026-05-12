import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Suspense } from "react";
import { StatusBadge } from "@/components/companies/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, getInitials } from "@/lib/utils";
import { Building2, Plus, ExternalLink, Globe, Link2 } from "lucide-react";
import type { Metadata } from "next";
import { CompaniesActions } from "./companies-actions";
import { Pagination } from "@/components/ui/pagination";
import { FilterBar } from "@/components/ui/filter-bar";


export const metadata: Metadata = { title: "Companies" };

interface SearchParams {
  status?: string;
  search?: string;
  page?: string;
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const pageSize = 20;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">
            Companies
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Manage your placement pipeline
          </p>
        </div>
        <Suspense fallback={<Button disabled><Plus className="h-4 w-4" />Add Company</Button>}>
          <CompaniesActions session={session} />
        </Suspense>
      </div>

      {/* Filters */}
      <FilterBar
        paramKey="status"
        baseUrl="/dashboard/companies"
        options={[
          { label: "All", value: "" },
          { label: "Lead Found", value: "LEAD_FOUND" },
          { label: "Interested", value: "INTERESTED" },
          { label: "PPT Scheduled", value: "PPT_SCHEDULED" },
          { label: "Offer Released", value: "OFFER_RELEASED" },
          { label: "No Response", value: "NO_RESPONSE" },
        ]}
      />

      <Suspense fallback={<CompaniesTableSkeleton />}>
        <CompaniesTableServer params={params} page={page} pageSize={pageSize} />
      </Suspense>
    </div>
  );
}

// ─── Async Component for Suspense ──────────────────────────────────────────

async function CompaniesTableServer({
  params,
  page,
  pageSize,
}: {
  params: SearchParams;
  page: number;
  pageSize: number;
}) {
  const where = {
    isDeleted: false,
    ...(params.status && { currentStatus: params.status as never }),
    ...(params.search && {
      OR: [
        { companyName: { contains: params.search, mode: "insensitive" as const } },
        { domain: { contains: params.search, mode: "insensitive" as const } },
        { industry: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { updatedAt: "desc" },
      include: {
        assignedCoordinator: { select: { name: true } },
        createdBy: { select: { name: true } },
        contacts: { where: { isPrimary: true }, take: 1 },
        _count: { select: { activities: true, followUps: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-zinc-800/50">
                {["Company", "Status", "Contact", "Coordinator", "Activities", "Updated"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      {h}
                    </th>
                  )
                )}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-zinc-500">
                    No companies found.{" "}
                    <Link
                      href="/dashboard/companies?add=1"
                      className="text-blue-400 hover:underline"
                    >
                      Add the first one
                    </Link>
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const primaryContact = company.contacts[0];
                  return (
                    <tr
                      key={company.id}
                      className="group transition-colors hover:bg-zinc-800/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-900/50 to-blue-900/50 text-xs font-bold text-blue-400">
                            {getInitials(company.companyName)}
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/companies/${company.id}`}
                              className="text-sm font-semibold text-zinc-100 hover:text-blue-400"
                            >
                              {company.companyName}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              {company.domain && (
                                <span className="text-xs text-zinc-500">{company.domain}</span>
                              )}
                              {company.website && (
                                <a href={company.website} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-blue-500">
                                  <Globe className="h-3 w-3" />
                                </a>
                              )}
                              {company.linkedin && (
                                <a href={company.linkedin} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-blue-400">
                                  <Link2 className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={company.currentStatus} />
                      </td>
                      <td className="px-4 py-3">
                        {primaryContact ? (
                          <div>
                            <p className="text-sm text-zinc-100">{primaryContact.name}</p>
                            <p className="text-xs text-zinc-500">{primaryContact.designation}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {company.assignedCoordinator ? (
                          <span className="text-sm text-zinc-300">
                            {company.assignedCoordinator.name}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-blue-950/30 px-2 py-0.5 text-xs font-medium text-blue-400">
                          {company._count.activities}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {formatDate(company.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/companies/${company.id}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 pb-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/dashboard/companies"
            searchParams={{ status: params.status, search: params.search }}
          />
        </div>
      </Card>
  );
}

function CompaniesTableSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead>
            <tr className="bg-zinc-800/50">
              {[...Array(6)].map((_, i) => (
                <th key={i} className="px-4 py-3"><div className="h-4 w-24 bg-zinc-800 rounded" /></th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {[...Array(8)].map((_, i) => (
              <tr key={i}>
                {[...Array(6)].map((_, j) => (
                  <td key={j} className="px-4 py-4"><div className="h-4 w-32 bg-zinc-800 rounded" /></td>
                ))}
                <td className="px-4 py-4"><div className="h-8 w-8 bg-zinc-800 rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
