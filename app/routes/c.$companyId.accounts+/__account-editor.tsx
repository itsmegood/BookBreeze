import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type Account } from '@prisma/client'
import {
	json,
	type ActionFunctionArgs,
	type SerializeFrom,
} from '@remix-run/node'
import { Form, redirect, useActionData } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '#app/components/forms'
import { StatusButton } from '#app/components/ui/status-button'
import { prisma } from '#app/utils/db.server'
import { useIsPending } from '#app/utils/misc'
import { requireCompanyUserWithRBAC } from '#app/utils/permissions.server'

// TODO: Make a better component to handle country, state, and city inputs
// ? Maybe a select component with api data

const CompanyAccountsNewSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(3).max(40),
	uniqueId: z.string().min(4).max(24).optional(),
	email: z.string().email().optional(),
	phone: z.string().min(7).max(15).optional(),
	address: z.string().min(4).max(40).optional(),
	country: z.string().min(4).max(24).optional(),
	city: z.string().min(4).max(24).optional(),
	state: z.string().min(4).max(24).optional(),
	zip: z.string().min(4).max(12).optional(),
	// description: z.string().min(4).max(80).optional(),
})

export async function action({ request, params }: ActionFunctionArgs) {
	const user = await requireCompanyUserWithRBAC({
		request,
		companyId: params.companyId!,
		permission: 'create:company-account',
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
		schema: CompanyAccountsNewSchema.superRefine(async (data, ctx) => {
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
		id: accountId,
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
			id: accountId ?? '__new_account__',
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

	return redirect(`/c/${params.companyId}/customers`)
}

export function AccountEditor({
	account,
}: {
	account?: SerializeFrom<
		Pick<
			Account,
			| 'id'
			| 'name'
			| 'uniqueId'
			| 'email'
			| 'phone'
			| 'address'
			| 'country'
			| 'state'
			| 'city'
			| 'zip'
		>
	>
}) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'company-accounts-editor-form',
		constraint: getZodConstraint(CompanyAccountsNewSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: CompanyAccountsNewSchema })
		},
		defaultValue: {
			...account,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<button type="submit" className="hidden" />
			{account ? <input type="hidden" name="id" value={account.id} /> : null}

			<div className="grid gap-x-6 sm:grid-cols-6">
				<div className="sm:col-span-3">
					<Field
						labelProps={{ children: 'Full Name *' }}
						inputProps={{
							...getInputProps(fields.name, { type: 'text' }),
							autoFocus: true,
						}}
						errors={fields.name.errors}
					/>
				</div>

				<div className="sm:col-span-3">
					<Field
						labelProps={{ children: 'Unique ID' }}
						inputProps={getInputProps(fields.uniqueId, { type: 'text' })}
						errors={fields.uniqueId.errors}
					/>
				</div>

				<div className="sm:col-span-4">
					<Field
						labelProps={{ children: 'Email' }}
						inputProps={getInputProps(fields.email, { type: 'email' })}
						errors={fields.email.errors}
					/>
				</div>

				<div className="sm:col-span-3">
					<Field
						labelProps={{ children: 'Phone' }}
						inputProps={getInputProps(fields.phone, { type: 'tel' })}
						errors={fields.phone.errors}
					/>
				</div>

				<div className="col-span-full">
					<Field
						labelProps={{ children: 'Address' }}
						inputProps={getInputProps(fields.address, { type: 'text' })}
						errors={fields.address.errors}
					/>
				</div>

				<div className="sm:col-span-2 sm:col-start-1">
					<Field
						labelProps={{ children: 'City' }}
						inputProps={getInputProps(fields.city, { type: 'text' })}
						errors={fields.city.errors}
					/>
				</div>

				<div className="sm:col-span-2">
					<Field
						labelProps={{ children: 'State' }}
						inputProps={getInputProps(fields.state, { type: 'text' })}
						errors={fields.state.errors}
					/>
				</div>

				<div className="sm:col-span-2">
					<Field
						labelProps={{ children: 'Country' }}
						inputProps={getInputProps(fields.country, { type: 'text' })}
						errors={fields.country.errors}
					/>
				</div>
				<StatusButton
					form={form.id}
					type="submit"
					disabled={isPending}
					status={isPending ? 'pending' : 'idle'}
					className="sticky bottom-4 sm:col-span-2"
				>
					Submit
				</StatusButton>
			</div>
		</Form>
	)
}
