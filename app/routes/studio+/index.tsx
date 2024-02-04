import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Button } from '#app/components/ui/button'
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
		<>
			<h2 className="text-h3 md:text-h2">Studio</h2>

			<div className="grid grid-cols-2 gap-6 text-center xl:grid-cols-4">
				<Link to="c" className="h-20">
					<Button variant="outline_2" size="full">
						Company Route
					</Button>
				</Link>
				<div>Maybe add statistics from all companies or just define routes</div>
			</div>

			<div className="flex items-center justify-between">
				<h3 className="text-h5 md:text-h4">Companies ~</h3>
				<Link to="c/new">
					<Button>Add Firm</Button>
				</Link>
			</div>

			<table className="min-w-full divide-y">
				<thead>
					<tr>
						<th
							scope="col"
							className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
						>
							Name
						</th>
						<th
							scope="col"
							className="hidden px-3 py-3.5 text-left text-sm font-semibold lg:table-cell"
						>
							Role
						</th>
						<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
							<span className="sr-only">Edit</span>
						</th>
					</tr>
				</thead>
				<tbody className="divide-y">
					{data.user.userCompanies.map(userCompany => (
						<tr key={userCompany.company.id} className="text-sm">
							<td className="w-full max-w-0 py-4 pl-4 pr-3 font-medium sm:w-auto sm:max-w-none sm:pl-0">
								{userCompany.company.name}
								<dl className="font-normal lg:hidden">
									<dt className="sr-only sm:hidden">Role</dt>
									<dd className="mt-1 truncate sm:hidden">
										{userCompany.isOwner ? 'Owner' : 'Employee'}
									</dd>
								</dl>
							</td>
							<td className="hidden px-3 py-4 sm:table-cell">
								{userCompany.isOwner ? 'Owner' : 'Employee'}
							</td>
							<td className="py-4 pl-3 pr-4 text-right font-medium sm:pr-0">
								<Link to={`/c/${userCompany.company.id}`}>
									<Button variant="link">View</Button>
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	)
}
