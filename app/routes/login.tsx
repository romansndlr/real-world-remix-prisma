import type { ActionArgs } from '@remix-run/node'
import { Form, Link, useActionData } from '@remix-run/react'
import { z } from 'zod'
import { authenticate, login } from '~/lib/auth.server'
import { ErrorMessages } from '~/components/error-messages'
import { nonEmptyStringSchema, validate } from '~/lib/validation.server'
import { actionFailed } from '~/lib/http.server'

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()

  const email = formData.get('email')
  const password = formData.get('password')

  const LoginUserSchema = z.object({
    email: nonEmptyStringSchema.email(),
    password: nonEmptyStringSchema,
  })

  try {
    const validated = await validate({ email, password }, LoginUserSchema)

    const user = await authenticate(validated.email, validated.password)

    return login({
      request,
      user,
      successMessage: `Welcome back ${user.name}!`,
    })
  } catch (error) {
    return actionFailed(error)
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>()

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign in</h1>
            <p className="text-xs-center">
              <Link to="/register">Need an account?</Link>
            </p>
            {actionData && <ErrorMessages errors={actionData.errors} />}
            <Form method="POST">
              <fieldset className="form-group">
                <input
                  className="form-control form-control-lg"
                  type="email"
                  placeholder="Email"
                  name="email"
                />
              </fieldset>
              <fieldset className="form-group">
                <input
                  className="form-control form-control-lg"
                  type="password"
                  placeholder="Password"
                  name="password"
                />
              </fieldset>
              <button className="btn btn-lg btn-primary pull-xs-right">
                Sign in
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
