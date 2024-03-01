import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { requireCompanyUserWithRBAC } from '#app/utils/permissions.server.ts'
import { AccountEditor } from './__account-editor.tsx'

export { action } from './__account-editor.server.tsx'

export async function loader({ params, request }: LoaderFunctionArgs) {
	await requireCompanyUserWithRBAC({
		request,
		companyId: params.companyId!,
		permission: 'create:company-account',
	})

	const account = await prisma.account.findFirst({
		where: {
			id: params.customerId!,
			companyId: params.companyId,
		},
		select: {
			id: true,
			name: true,
			uniqueId: true,
			email: true,
			phone: true,
			address: true,
			country: true,
			city: true,
			state: true,
			zip: true,
		},
	})

	invariantResponse(account, 'Not found', { status: 404 })

	return json({ account: account })
}

export default function CompanyAccountsEdit() {
	const data = useLoaderData<typeof loader>()

	return <AccountEditor account={data.account} />
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No account with the id "{params.customerId}" exists</p>
				),
			}}
		/>
	)
}
