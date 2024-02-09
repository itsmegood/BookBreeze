import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type CustomerAccount } from '@prisma/client'
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
					customers: {
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
		id: customerAccountId,
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

	await prisma.customerAccount.upsert({
		where: {
			id: customerAccountId ?? '__new_customer__',
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

export function CustomerAccountEditor({
	customerAccount,
}: {
	customerAccount?: SerializeFrom<
		Pick<
			CustomerAccount,
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
		id: 'company-accounts-new-form',
		constraint: getZodConstraint(CompanyAccountsNewSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: CompanyAccountsNewSchema })
		},
		defaultValue: {
			...customerAccount,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<>
			<div className="flex items-center">
				<p className="text-lg font-bold">Customer Account Editor</p>
				<div className="ml-2 cursor-pointer">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width={16}
						height={16}
					>
						<path
							className="heroicon-ui"
							d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
							fill="currentColor"
						/>
					</svg>
				</div>
			</div>

			<Form method="POST" {...getFormProps(form)}>
				<button type="submit" className="hidden" />
				{customerAccount ? (
					<input type="hidden" name="id" value={customerAccount.id} />
				) : null}

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
		</>
	)
}
