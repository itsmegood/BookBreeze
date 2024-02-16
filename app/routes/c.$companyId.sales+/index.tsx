import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
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
			id: true,
			invoiceCount: true,
			saleInvoices: {
				select: {
					id: true,
					issuedTo: {
						select: {
							name: true,
						},
					},
					issuedToId: true,
					totalAmount: true,
				},
			},
			accounts: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	})
	invariantResponse(company, 'Not found', { status: 404 })
	// return json({ company })

	return json({ company })
}

export default function CompanySalesOverview() {
	const data = useLoaderData<typeof loader>()

	return (
		<div className="">
			<h1>Overview Route</h1>
			<div>
				{data.company.saleInvoices.map(invoice => (
					<div key={invoice.id}>
						{invoice.id} - {invoice.issuedTo.name} - {invoice.totalAmount}
					</div>
				))}
			</div>
		</div>
	)
}
