import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { logoutAndRedirect, requireUserId } from '#app/utils/auth.server'
import { prisma } from '#app/utils/db.server'
import { Button } from '#app/components/ui/button'
import { Spacer } from '#app/components/spacer'

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
		<>
			<h2 className="text-h3 md:text-h2">Studio</h2>

			<div className="grid grid-cols-2 gap-6 text-center xl:grid-cols-4">
				<Link to="hello" className="h-full rounded-md border border-primary">
					<Button variant="outline_2" size="full">
						Hello
					</Button>
				</Link>
				<div className="rounded-md border border-primary p-10">Hello</div>
				<div className="rounded-md border border-primary p-10">Hello</div>
				<div className="rounded-md border border-primary p-10">Hello</div>
			</div>

			<div>
				{data.user.userCompanies.map(userCompany => (
					<div key={userCompany.id}>
						{userCompany.company.name} :{' '}
						{userCompany.isOwner ? 'true' : 'false'} :{' '}
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
		</>
	)
}
