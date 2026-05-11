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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
            <Building2 className="h-5 w-5 text-indigo-600" />
            Companies
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            {total} companies in pipeline
          </p>
        </div>
        <Suspense fallback={<Button disabled><Plus className="h-4 w-4" />Add Company</Button>}>
          <CompaniesActions session={session} />
        </Suspense>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", value: "" },
          { label: "Lead Found", value: "LEAD_FOUND" },
          { label: "Interested", value: "INTERESTED" },
          { label: "PPT Scheduled", value: "PPT_SCHEDULED" },
          { label: "Offer Released", value: "OFFER_RELEASED" },
          { label: "No Response", value: "NO_RESPONSE" },
        ].map((filter) => (
          <Link
            key={filter.value}
            href={`/dashboard/companies?${filter.value ? `status=${filter.value}` : ""}${params.search ? `&search=${params.search}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              (params.status ?? "") === filter.value
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/50">
                {["Company", "Status", "Contact", "Coordinator", "Activities", "Updated"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400"
                    >
                      {h}
                    </th>
                  )
                )}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">
                    No companies found.{" "}
                    <Link
                      href="/dashboard/companies?add=1"
                      className="text-indigo-600 hover:underline"
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
                      className="group transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 text-xs font-bold text-indigo-700 dark:from-indigo-900/50 dark:to-violet-900/50 dark:text-indigo-300">
                            {getInitials(company.companyName)}
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/companies/${company.id}`}
                              className="text-sm font-semibold text-gray-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
                            >
                              {company.companyName}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              {company.domain && (
                                <span className="text-xs text-gray-400">{company.domain}</span>
                              )}
                              {company.website && (
                                <a href={company.website} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-indigo-500">
                                  <Globe className="h-3 w-3" />
                                </a>
                              )}
                              {company.linkedin && (
                                <a href={company.linkedin} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-blue-600">
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
                            <p className="text-sm text-gray-900 dark:text-zinc-100">{primaryContact.name}</p>
                            <p className="text-xs text-gray-400">{primaryContact.designation}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {company.assignedCoordinator ? (
                          <span className="text-sm text-gray-700 dark:text-zinc-300">
                            {company.assignedCoordinator.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {company._count.activities}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-zinc-800">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link href={`/dashboard/companies?page=${page - 1}${params.status ? `&status=${params.status}` : ""}`}>
                  <Button variant="outline" size="sm">Previous</Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/dashboard/companies?page=${page + 1}${params.status ? `&status=${params.status}` : ""}`}>
                  <Button variant="outline" size="sm">Next</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
