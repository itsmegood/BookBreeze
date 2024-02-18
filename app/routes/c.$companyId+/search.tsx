import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { SearchBar } from '#app/components/search-bar'
import { Button } from '#app/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '#app/components/ui/dropdown-menu'
import { Icon, type IconName } from '#app/components/ui/icon'
import { prisma } from '#app/utils/db.server'
import { requireCompanyUserWithRBAC } from '#app/utils/permissions.server'

let accounts: {
	id: string
	name: string
	uniqueId: string | null
}[] = []

let saleInvoices: {
	id: string
	dateIssued: Date
	dueDate: Date
	totalAmount: number
	issuedTo: {
		name: string
		uniqueId: string | null
	}
	transactionStatus: {
		key: string
		label: string | null
		color: string | null
	}
}[] = []

let purchaseBills: {
	dateIssued: Date
	dueDate: Date
	transactionStatus: {
		key: string
		label: string | null
		color: string | null
	}
	billNumber: string
	paidToAccount: {
		id: string
		name: string
		uniqueId: string | null
	}
}[] = []

const searchKeywords = {
	Account: 'acc',
	Account_UID: 'uid',
	Invoice: 'inv',
	Bill: 'bill',
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	// const user = await requireCompanyUserWithRBAC({
	await requireCompanyUserWithRBAC({
		request,
		companyId: params.companyId!,
		permission: 'read:company-account',
		select: {
			userCompanies: {
				select: {
					companyId: true,
				},
			},
		},
	})

	const url = new URL(request.url)
	const searchTerm = String(url.searchParams.get('search'))

	if (!searchTerm || searchTerm.trim().length < 3 || searchTerm.length > 20)
		return null

	// Matching keywords -> $keyword:field
	// const match = searchTerm.match(/^\$(\w+):(.*)$/) // $acc:john
	// ^ Matching keywords -> keyword:field
	const match = searchTerm.trim().includes(':')
		? searchTerm.trim().split(':')
		: null // acc:john

	// !
	// !
	// ! I might ban this all out search just too much stuff to search and return
	// ! it might go through millions of things to get me a transaction out
	// !
	// !

	if (match === null) {
		const like = `%${searchTerm.trim()}%`

		accounts = await prisma.account.findMany({
			where: {
				// companyId: user.userCompanies[0].companyId
				companyId: params.companyId,
				OR: [{ name: { contains: like } }, { uniqueId: { contains: like } }],
			},
			select: {
				id: true,
				name: true,
				uniqueId: true,
			},
			orderBy: {
				createdAt: 'asc',
			},
		})

		saleInvoices = await prisma.saleInvoice.findMany({
			where: {
				// companyId: user.userCompanies[0].companyId
				companyId: params.companyId,
				OR: [
					{
						issuedTo: {
							OR: [
								{
									name: {
										contains: like,
									},
								},
								{
									uniqueId: {
										contains: like,
									},
								},
							],
						},
					},
				],
			},
			select: {
				id: true,
				issuedTo: {
					select: {
						name: true,
						uniqueId: true,
					},
				},
				dateIssued: true,
				totalAmount: true,
				dueDate: true,
				transactionStatus: {
					select: {
						key: true,
						label: true,
						color: true,
					},
				},
			},
		})

		purchaseBills = await prisma.purchaseBill.findMany({
			where: {
				// companyId: user.userCompanies[0].companyId
				companyId: params.companyId,
				OR: [
					{
						billNumber: {
							contains: like,
						},
					},
					{
						paidToAccount: {
							OR: [
								{
									name: {
										contains: like,
									},
								},
							],
						},
					},
				],
			},
			select: {
				billNumber: true,
				dateIssued: true,
				dueDate: true,
				paidToAccount: {
					select: {
						id: true,
						name: true,
						uniqueId: true,
					},
				},
				transactionStatus: {
					select: {
						key: true,
						label: true,
						color: true,
					},
				},
			},
		})

		return json({ accounts, saleInvoices, purchaseBills })
	}

	// we do not need the first element of the array

	let keyword: string = ''
	let field: string | undefined = undefined

	if (match) {
		;[keyword, field] = match
	}

	if (field && field?.length > 0) {
		const like = `%${field.trim()}%`

		switch (keyword.toLowerCase()) {
			case searchKeywords.Account:
				accounts = await prisma.account.findMany({
					where: {
						// companyId: user.userCompanies[0].companyId
						companyId: params.companyId,
						name: {
							contains: like,
						},
					},
					select: {
						id: true,
						name: true,
						uniqueId: true,
					},
				})
				break

			case searchKeywords.Account_UID:
				accounts = await prisma.account.findMany({
					where: {
						// companyId: user.userCompanies[0].companyId
						companyId: params.companyId,
						uniqueId: {
							contains: like,
						},
					},
					select: {
						id: true,
						name: true,
						uniqueId: true,
					},
				})
				break

			case searchKeywords.Invoice:
				saleInvoices = await prisma.saleInvoice.findMany({
					where: {
						// companyId: user.userCompanies[0].companyId
						companyId: params.companyId,
						invoiceNumber: {
							equals: parseInt(like),
						},
					},
					select: {
						id: true,
						issuedTo: {
							select: {
								name: true,
								uniqueId: true,
							},
						},
						transactionStatus: {
							select: {
								key: true,
								label: true,
								color: true,
							},
						},
						dateIssued: true,
						totalAmount: true,
						dueDate: true,
					},
				})
				break

			case searchKeywords.Bill:
				purchaseBills = await prisma.purchaseBill.findMany({
					where: {
						// companyId: user.userCompanies[0].companyId
						companyId: params.companyId,
						billNumber: {
							contains: like,
						},
					},
					select: {
						billNumber: true,
						dateIssued: true,
						dueDate: true,
						paidToAccount: {
							select: {
								id: true,
								name: true,
								uniqueId: true,
							},
						},
						transactionStatus: {
							select: {
								key: true,
								label: true,
								color: true,
							},
						},
					},
				})
				break
		}
	}

	return json({ accounts, saleInvoices, purchaseBills })
}

export default function CompanySearch() {
	const data = useLoaderData<typeof loader>()

	return (
		<>
			<h2 className="text-h3 md:text-h2">Discover</h2>

			<div className="space-y-2">
				<SearchBar status="idle" action="" autoSubmit autoFocusSearch />

				<div className="flex items-center space-x-4">
					<Link to="hello" className="text-primary">
						Advanced Search
					</Link>
					<Link to="hello" className="text-primary">
						Filter
					</Link>
				</div>
			</div>

			{data && (
				<section className="space-y-6">
					{data.accounts.length > 0 && (
						<>
							<h3 className="text-h4">Accounts</h3>

							<ul className="grid gap-2">
								{data.accounts.map(account => (
									<li
										key={account.id}
										className="flex items-center justify-between rounded-lg border p-2"
										onClick={() => {}}
									>
										<div>
											{account.name} - {account.uniqueId}
										</div>
										<SimpleDropDown
											items={[
												{
													label: 'New Sale',
													href: `../sales/new/${account.id}`,
													icon: 'file-text',
												},
												{ label: 'Edit', href: 'hello', icon: 'pencil-1' },
											]}
										/>
									</li>
								))}
								{data.accounts.map(account => (
									<li
										key={account.id}
										className="flex items-center justify-between rounded-lg border p-2"
										onClick={() => {}}
									>
										<div>
											{account.name} - {account.uniqueId}
										</div>
										{/* <SimpleDropDown items={accountDropdownItems} /> */}
									</li>
								))}
								{data.accounts.map(account => (
									<li
										key={account.id}
										className="flex items-center justify-between rounded-lg border p-2"
										onClick={() => {}}
									>
										<div>
											{account.name} - {account.uniqueId}
										</div>
										{/* <SimpleDropDown items={accountDropdownItems} /> */}
									</li>
								))}
							</ul>
						</>
					)}

					{data.saleInvoices.length > 0 && (
						<>
							<h3 className="text-h4">Sale Invoices</h3>
							<ul>
								{data.saleInvoices.map(invoice => (
									<li key={invoice.id}>
										{invoice.issuedTo.name} - {invoice.issuedTo.uniqueId}
									</li>
								))}
							</ul>
						</>
					)}

					{data.purchaseBills.length > 0 && (
						<>
							<h3 className="text-h4">Purchase Bills</h3>
							<ul>
								{data.purchaseBills.map(bill => (
									<li key={bill.billNumber}>
										{bill.paidToAccount.name} - {bill.paidToAccount.uniqueId}
									</li>
								))}
							</ul>
						</>
					)}
				</section>
			)}
		</>
	)
}

export type SimpleDropDownProps = {
	label: string
	href: string
	icon?: IconName
}[]

export function SimpleDropDown({ items }: { items: SimpleDropDownProps }) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					type="button"
					onClick={e => e.preventDefault()}
					className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
				>
					<Icon name="menu" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				{items.map(item => (
					<Link to={item.href} key={item.label}>
						<DropdownMenuItem className="gap-2">
							{item.icon && <Icon name={item.icon} />}
							{item.label}
						</DropdownMenuItem>
					</Link>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
