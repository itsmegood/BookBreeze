import { type LoaderFunctionArgs } from '@remix-run/node'
import { requireCompanyUserWithRBAC } from '#app/utils/permissions.server'
import { AccountEditor} from './__account-editor'

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requireCompanyUserWithRBAC({
		request,
		companyId: params.companyId!,
		permission: 'create:company-account',
	})

	return null
}

export { action } from './__account-editor.server'
export default AccountEditor
