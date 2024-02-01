import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { requireUserId } from '#app/utils/auth.server'
import { prisma } from '#app/utils/db.server'
import { redirectWithToast } from '#app/utils/toast.server'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)

	return null
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)

	const company = await prisma.company.create({
		data: {
			name: 'test',
			users: {
				create: {
					userId: userId,
					isOwner: true,
				},
			},
		},
		select: {
			id: true,
			name: true,
		},
	})

	return redirectWithToast(`/c/${company.id}`, {
		type: 'success',
		title: 'Company Created!',
		description: `You've created ${company.name} company!`,
	})
}

export default function CompanyNew() {
	return (
		<div>
			<h1>Unknown Route</h1>
		</div>
	)
}
