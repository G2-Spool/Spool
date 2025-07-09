import { createServerRunner } from '@aws-amplify/adapter-nextjs'
import config from '@/lib/amplify-config'

export const { runWithAmplifyServerContext } = createServerRunner({
  config
}) 