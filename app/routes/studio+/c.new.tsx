import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { Form, json, useActionData } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '#app/components/forms'
import { requireUserId } from '#app/utils/auth.server'
import { PLATFORM_STATUS } from '#app/utils/constants/platform-status'
import { prisma } from '#app/utils/db.server'
import { redirectWithToast } from '#app/utils/toast.server'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)

	return null
}

const StudioCompanyNewSchema = z.object({
	name: z.string().min(4).max(60),
})

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)

	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: StudioCompanyNewSchema.superRefine(async (data, ctx) => {
			const existingCompany = await prisma.user.findFirst({
				where: {
					id: userId,
					userCompanies: {
						some: {
							company: {
								name: data.name,
							},
							isOwner: true,
						},
					},
				},
				select: {
					id: true,
				},
			})

			if (existingCompany) {
				ctx.addIssue({
					path: ['name'],
					code: z.ZodIssueCode.custom,
					message: 'A company with this name already exists',
				})
				return
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

	const { name } = submission.value

	const company = await prisma.company.create({
		data: {
			name,
			users: {
				create: {
					userId: userId,
					isOwner: true,

					// ! Play with roles
					// Role: {
					// 	connect: {
					// 		name: 'company',
					// 		permissions: {
					// 			some: {
					// 				access: {
					// 					contains: 'own',
					// 				},
					// 				action: {
					// 					contains: '',
					// 				},
					// 			},
					// 		},
					// 	},
					// },
				},
			},
			platformStatusKey: PLATFORM_STATUS.ACTIVE.KEY,
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

export default function StudioCompanyNew() {
	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'company-new',
		constraint: getZodConstraint(StudioCompanyNewSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: StudioCompanyNewSchema })
		},
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<Field
				labelProps={{
					htmlFor: fields.name.id,
					children: 'Company Name',
				}}
				inputProps={{
					...getInputProps(fields.name, { type: 'text' }),
					autoComplete: 'one-time-code',
				}}
				errors={fields.name.errors}
			/>
		</Form>
	)
}
