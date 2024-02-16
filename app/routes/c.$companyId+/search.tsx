import { requireCompanyUserWithRBAC } from '#app/utils/permissions.server'
import { type LoaderFunctionArgs, json } from '@remix-run/node'

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requireCompanyUserWithRBAC({
		request,
		companyId: params.companyId!,
		permission: 'read:company-account',
	})

	const url = new URL(request.url)
	const search = url.searchParams.get('search')

	return json({})
}

export default function CompanySearch() {
	return (
		<div>
			<h1>Unknown Route</h1>
		</div>
	)
}
