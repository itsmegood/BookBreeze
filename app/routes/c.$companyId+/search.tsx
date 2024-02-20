import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useLoaderData, useParams } from '@remix-run/react'
import { SearchBar } from '#app/components/search-bar'
import { Button } from '#app/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '#app/components/ui/dropdown-menu'
import { Icon, type IconName } from '#app/components/ui/icon'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '#app/components/ui/tooltip'
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
	Account: {
		key: 'acc',
		info: 'Search for accounts using names',
	},
	Account_UID: {
		key: 'uid',
		info: 'Search for accounts by unique ID',
	},
	Invoice: {
		key: 'inv',
		info: 'Search for invoices using invoice number',
	},
	Bill: {
		key: 'bill',
		info: 'Search for bills via bill number',
	},
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
	// ? q stands for query
	const searchTerm = String(url.searchParams.get('q'))

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
			case searchKeywords.Account.key:
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

			case searchKeywords.Account_UID.key:
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

			case searchKeywords.Invoice.key:
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

			case searchKeywords.Bill.key:
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

	const params = useParams()

	return (
		<>
			<h2 className="text-h3 md:text-h2">Discover</h2>

			<div>
				<SearchBar
					status="idle"
					action=""
					autoSubmit
					autoFocusSearch
					searchParam="q"
				/>

				<div className="mt-1 flex flex-col gap-2 text-sm font-light text-foreground/45 md:flex-row md:items-center">
					Search faster using keywords
					<div className="flex gap-2 overflow-x-auto">
						<TooltipProvider>
							{Object.entries(searchKeywords).map(([_, value]) => (
								<Tooltip key={value.key}>
									<TooltipTrigger
										tabIndex={-1}
										className="rounded-lg bg-muted p-1"
									>
										<Icon name="question-mark-circled">{value.key}:</Icon>
									</TooltipTrigger>
									<TooltipContent side="bottom">{value.info}</TooltipContent>
								</Tooltip>
							))}
						</TooltipProvider>
					</div>
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
													href: `/c/${params.companyId}/sales/new-invoice?accountId=${account.id}`,
													icon: 'file-text',
												},
												{ label: 'View', href: 'hello', icon: 'avatar' },
											]}
										/>
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
