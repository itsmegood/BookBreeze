import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { logoutAndRedirect, requireUserId } from '#app/utils/auth.server'
import { prisma } from '#app/utils/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			name: true,
			userCompanies: {
				select: {
					id: true,
					isOwner: true,
					company: {
						select: {
							id: true,
							name: true,
						},
					},
					Role: {
						select: {
							name: true,
							permissions: true,
						},
					},
				},
			},
		},
	})

	if (!user) return logoutAndRedirect(request)

	return json({ user })
}

export default function StudioIndex() {
	const data = useLoaderData<typeof loader>()

	return (
		<div>
			<h1>Unknown Route</h1>
			<div>{data.user.name}</div>
			<div>
				{data.user.userCompanies.map(userCompany => (
					<div key={userCompany.id}>
						{userCompany.company.name} : {userCompany.isOwner} :{' '}
						{userCompany.Role.map(role => (
							<div key={role.name}>
								{role.name} :{' '}
								{role.permissions.map(permission => (
									<div key={permission.entity}>
										{permission.entity} : {permission.action} :{' '}
										{permission.access}
									</div>
								))}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	)
}
