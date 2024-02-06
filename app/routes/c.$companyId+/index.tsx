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
			name: true,
		},
	})

	invariantResponse(company, 'Not found', { status: 404 })

	return json({ company })
}

export default function CompanyIndex() {
	const data = useLoaderData<typeof loader>()

	// Get company daily/monthly metrics
	// Get company basic stats

	return (
		<div>
			<h1 className="text-h3 md:text-h2">{data.company.name}</h1>
		</div>
	)
}
