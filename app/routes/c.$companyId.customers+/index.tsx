import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
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
			customers: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	})

	invariantResponse(company, 'Not found', { status: 404 })

	return json({ company })
}

export default function CompanyCustomerAccountsOverview() {
	const data = useLoaderData<typeof loader>()

	return (
		<div>
			<h1>Overview Route</h1>
			<div className="flex gap-10">
				{data.company.customers.map(customer => (
					<Link to={`${customer.id}/edit`} key={customer.id}>
						{customer.name}
					</Link>
				))}
			</div>
		</div>
	)
}
