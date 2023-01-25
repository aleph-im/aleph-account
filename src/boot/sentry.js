import Vue from 'vue'
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'
import router from 'src/router'

Sentry.init({
  Vue,
  dsn: 'https://53d89028862e41a9a9b0c64df8a4c405@o1133345.ingest.sentry.io/6192706',
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router())
    //   tracePropagationTargets: ['localhost', 'my-site-url.com', /^\//]
    })
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.25
})
