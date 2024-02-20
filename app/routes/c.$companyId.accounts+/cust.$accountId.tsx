import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.ts'
import { requireCompanyUserWithRBAC } from '#app/utils/permissions.server.ts'

export async function loader({ params, request }: LoaderFunctionArgs) {
	await requireCompanyUserWithRBAC({
		request,
		companyId: params.companyId!,
		permission: 'create:company-account',
	})

	const account = await prisma.account.findFirst({
		where: {
			id: params.accountId!,
			companyId: params.companyId,
		},
		select: {
			id: true,
			name: true,
			uniqueId: true,
			email: true,
			phone: true,
			address: true,
			country: true,
			city: true,
			state: true,
			zip: true,
			SaleInvoice: {
				select: {
					id: true,
					dateIssued: true,
					totalAmount: true,
					transactionStatus: true,
				},
			},
			PurchaseBill: {
				select: {
					id: true,
					dateIssued: true,
					totalAmount: true,
					transactionStatus: true,
				},
			},
		},
	})

	invariantResponse(account, 'Not found', { status: 404 })

	return json({ account })
}

export default function CompanyAccountCustomer() {
	const data = useLoaderData<typeof loader>()

	return (
		<div>
			{data.account.name}
			{data.account.uniqueId}
			{data.account.email}
			{data.account.phone}
			{data.account.address}
			{data.account.country}
			{data.account.city}
			{data.account.state}
			{data.account.zip}
			{data.account.SaleInvoice.map(invoice => (
				<div key={invoice.id}>
					{invoice.dateIssued}
					{invoice.totalAmount}
					{invoice.transactionStatus.key}
				</div>
			))}
			{data.account.PurchaseBill.map(bill => (
				<div key={bill.id}>
					{bill.dateIssued}
					{bill.totalAmount}
					{bill.transactionStatus.key}
				</div>
			))}
		</div>
	)
}
