import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { SearchBar } from '#app/components/search-bar'
import { requireCompanyUserWithRBAC } from '#app/utils/permissions.server'
import { useLoaderData } from '@remix-run/react'

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requireCompanyUserWithRBAC({
		request,
		companyId: params.companyId!,
		permission: 'create:company-sale',
	})

	return json({ companyId: params.companyId })
}

export default function NewSale() {
	const data = useLoaderData<typeof loader>()

	return (
		<div>
			<SearchBar
				searchParam="accQ"
				status="idle"
				action={`/c/${data.companyId}/sales+`}
				autoSubmit
				autoFocusSearch
			/>

			<h1>Unknown Route</h1>
		</div>
	)
}
