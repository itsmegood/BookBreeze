import { parseWithZod } from '@conform-to/zod'
import { json, type ActionFunctionArgs, redirect } from '@remix-run/node'
import { z } from 'zod'
import { prisma } from '#app/utils/db.server'
import { requireCompanyUserWithRBAC } from '#app/utils/permissions.server'
import { CompanySalesEditorSchema } from './__sale-editor'

export async function action({ request, params }: ActionFunctionArgs) {
	const user = await requireCompanyUserWithRBAC({
		request,
		companyId: params.companyId!,
		permission: 'create:company-sale',
		select: {
			userCompanies: {
				select: {
					id: true,
				},
			},
		},
	})

	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: CompanySalesEditorSchema.superRefine(async (data, ctx) => {
			const checkName = await prisma.company.findFirst({
				where: {
					accounts: {
						some: {
							name: data.name,
						},
					},
				},
			})

			if (checkName) {
				ctx.addIssue({
					path: ['name'],
					code: z.ZodIssueCode.custom,
					message: 'Name already exists',
				})
			}
		}),
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const {
		id: saleId,
		name,
		uniqueId,
		email,
		phone,
		address,
		city,
		state,
		country,
		zip,
	} = submission.value

	await prisma.account.upsert({
		where: {
			id: saleId ?? '__new_sale__',
		},
		create: {
			name,
			uniqueId,
			email,
			phone,
			address,
			city,
			state,
			country,
			zip,
			companyId: params.companyId!,
			createdById: user.userCompanies[0].id,
		},
		update: {
			name,
			uniqueId,
			email,
			phone,
			address,
			city,
			state,
			country,
			zip,
		},
	})

	return redirect(`/c/${params.companyId}/sales`)
}
