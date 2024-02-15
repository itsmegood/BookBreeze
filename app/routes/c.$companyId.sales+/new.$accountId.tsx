import { type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '#app/utils/db.server'
import { requireCompanyUserWithRBAC } from '#app/utils/permissions.server'
import { SaleEditor, action } from './__sale-editor'

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requireCompanyUserWithRBAC({
		request,
		companyId: params.companyId!,
		permission: 'create:company-account',
	})

	const account = await prisma.account.findFirst({
		where: {
			id: params.accountId,
			companyId: params.companyId,
		},
		select: {},
	})

	return null
}

export { action }

export default function CompanyAccountsEdit() {
	const data = useLoaderData<typeof loader>()

	return <SaleEditor sale={data.account} />
}
