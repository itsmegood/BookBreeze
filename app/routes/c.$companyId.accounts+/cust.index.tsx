import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Button } from '#app/components/ui/button'
import { requireUserId } from '#app/utils/auth.server'
import { PLATFORM_STATUS } from '#app/utils/constants/platform-status'
import { prisma } from '#app/utils/db.server'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)

	const company = await prisma.company.findUnique({
		where: {
			id: params.companyId,
			users: {
				some: {
					userId: userId,
				},
			},
			platformStatusKey: PLATFORM_STATUS.ACTIVE.KEY,
		},
		select: {
			accounts: {
				select: {
					id: true,
					name: true,
					uniqueId: true,
				},
			},
		},
	})

	invariantResponse(company, 'Not found', { status: 404 })

	return json({ company })
}

export default function CompanyAccountsCustomer() {
	const data = useLoaderData<typeof loader>()

	return (
		<>
			<table className="min-w-full divide-y">
				<thead>
					<tr className="text-left text-sm font-semibold">
						<th scope="col" className="py-3.5 pr-3">
							Name
						</th>
						<th scope="col" className="hidden px-3 py-3.5 lg:table-cell">
							Unique Id
						</th>
						<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
							<span className="sr-only">Edit</span>
						</th>
					</tr>
				</thead>
				<tbody className="divide-y">
					{data.company.accounts.map(customer => (
						<tr key={customer.id}>
							<td className="w-full max-w-0 py-4 pr-3 font-medium sm:w-auto sm:max-w-none">
								{customer.name}
								<dl className="font-normal lg:hidden">
									<dt className="sr-only sm:hidden">Unique Id</dt>
									<dd className="mt-1 truncate text-sm sm:hidden">
										{customer.uniqueId ?? '-'}
									</dd>
								</dl>
							</td>
							<td className="hidden px-3 py-4 sm:table-cell">
								{customer.uniqueId ?? '-'}
							</td>
							<td className="py-4 pl-3 pr-4 text-right font-medium sm:pr-0">
								<Link to={`${customer.id}`}>
									<Button variant="link">View</Button>
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	)
}
