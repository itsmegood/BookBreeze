import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect, useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server'
import { requireCompanyUserWithRBAC } from '#app/utils/permissions.server'
import { SaleEditor } from './__sale-editor'

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requireCompanyUserWithRBAC({
		request,
		companyId: params.companyId!,
		permission: 'create:company-account',
	})

	const url = new URL(request.url)
	const searchParams = url.searchParams

	// ! Removing guest mode for now I can just make a misc account for all guest stuff
	// const checkGuest = searchParams.get('guest')
	// if (checkGuest) return null

	const accountId = searchParams.get('accountId')

	if (!accountId || accountId.length < 25 || accountId.length > 36)
		return redirect(`/c/${params.companyId}/search?q=acc:`)

	const account = await prisma.account.findFirst({
		where: {
			id: params.accountId,
			companyId: params.companyId,
		},
		select: {
			id: true,
			name: true,
			balance: true,
			uniqueId: true,
			// phone: true,
		},
	})
	return json({ account })
}

export default function CompanySaleNew() {
	const data = useLoaderData<typeof loader>()

	return <SaleEditor sale={data.account} />
}

// ! Remove the guest stuff completely
// export default function CompanySaleNew()
// 	const data = useLoaderData<typeof loader>()

// const params = useParams()

// // create a modal to select whether to enter guest mode or search account using tailwindcss and react
// return (
// <div className="flex h-screen flex-col items-center justify-center space-y-4">
// 	<Link
// 		to="?guest=true"
// 		className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
// 		autoFocus
// 		onClick={() => console.log('Entering Guest Mode')}
// 	>
// 		Guest Mode
// 	</Link>
// 	<Link to={`/c/${params.companyId}/search`}
// 		className="rounded bg-green-500 px-6 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50"
// 		onClick={() => console.log('Searching Account')}
// 	>
// 		Search Account
// 	</Link>
// </div>

// 		)
// }
