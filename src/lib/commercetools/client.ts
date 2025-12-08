import { ClientBuilder } from '@commercetools/sdk-client-v2'
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk'
import { env } from '@/lib/env'

/**
 * Create a commercetools client with client credentials flow
 */
function createCommercetoolsClient() {
	const projectKey = env.getOptionalByKey('CTP_PROJECT_KEY')
	const clientId = env.getOptionalByKey('CTP_CLIENT_ID')
	const clientSecret = env.getOptionalByKey('CTP_CLIENT_SECRET')
	const authUrl = env.getOptionalByKey('CTP_AUTH_URL') || 'https://auth.commercetools.com'
	const apiUrl = env.getOptionalByKey('CTP_API_URL') || 'https://api.commercetools.com'

	if (!projectKey || !clientId || !clientSecret) {
		throw new Error(
			'Missing commercetools credentials. Please set CTP_PROJECT_KEY, CTP_CLIENT_ID, and CTP_CLIENT_SECRET environment variables.'
		)
	}

	const client = new ClientBuilder()
		.withProjectKey(projectKey)
		.withClientCredentialsFlow({
			host: authUrl,
			projectKey,
			credentials: {
				clientId,
				clientSecret,
			},
		})
		.withHttpMiddleware({
			host: apiUrl,
		})
		.build()

	return client
}

/**
 * Get the commercetools API root for making requests
 */
export function getCommercetoolsApiRoot() {
	const client = createCommercetoolsClient()
	const projectKey = env.getOptionalByKey('CTP_PROJECT_KEY')

	if (!projectKey) {
		throw new Error('CTP_PROJECT_KEY is required')
	}

	return createApiBuilderFromCtpClient(client).withProjectKey({
		projectKey,
	})
}

export default getCommercetoolsApiRoot

