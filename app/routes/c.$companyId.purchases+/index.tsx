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
			purchaseBills: {
				select: {
					id: true,
					paidToAccount: {
						select: {
							name: true,
						},
					},
					paidToAccountId: true,
					totalAmount: true,
				},
			},
		},
	})

	invariantResponse(company, 'Not found', { status: 404 })

	return json({ company })
}

export default function CompanyPurchasesOverview() {
	const data = useLoaderData<typeof loader>()

	return (
		<div>
			<ul>
				{data.company.purchaseBills.map(bill => (
					<li key={bill.id} className="flex w-full">
						<div>{bill.paidToAccount.name}</div>
					</li>
				))}
			</ul>
		</div>
	)
}
