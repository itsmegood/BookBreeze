import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { requireCompanyUserWithRBAC } from '#app/utils/permissions.server.ts'
import { CustomerAccountEditor, action } from './__customer-account-editor.tsx'

export { action }

export async function loader({ params, request }: LoaderFunctionArgs) {
	await requireCompanyUserWithRBAC({
		request,
		companyId: params.companyId!,
		permission: 'create:company-account',
	})

	const customerAccount = await prisma.customerAccount.findFirst({
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

	invariantResponse(customerAccount, 'Not found', { status: 404 })

	return json({ customerAccount: customerAccount })
}

export default function CompanyAccountsEdit() {
	const data = useLoaderData<typeof loader>()

	return <CustomerAccountEditor customerAccount={data.customerAccount} />
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
