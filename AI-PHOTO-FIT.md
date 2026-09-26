# AI photo length check

The Worker serves existing assets and /api/photo-fit. Deploy with `npx wrangler deploy` from the repo root. `wrangler.jsonc` includes a Worker entry point so Cloudflare runtime secrets can be added after the first successful deployment. If the dashboard deploy command uses `--assets .`, the same configuration still supplies the Worker entry point. No migration to another hosting provider is required.

After deployment, add a runtime Secret named OPENAI_API_KEY to the existing myhockeyfit Worker. Never put it in Builds, client JavaScript, git, or screenshots. Redeploy if the dashboard requests it. GET /api/photo-fit reports enabled:false until both the secret and rate limiter binding exist; enabled:true reports configuration presence, not a successful OpenAI call.

The optional AI button requires explicit photo-sharing consent. Capture is resized to at most 1600 pixels and encoded as JPEG. The clean captured image is kept separately from manual drawn markers, then cleared on close, retake, navigation or result. A cancelled browser request cannot guarantee upstream processing has stopped.

The server uses OpenAI Responses with gpt-4.1-mini, strict JSON output and store:false. It does not write images or responses to a database, object store or application log. OpenAI retention policies still apply; store:false is not a promise of zero provider retention. Disclosure is shown before sending. Manual checks remain local.

Only upright standing length is estimated. The blade toe (front tip) must touch the floor with the heel raised; heel contact or a flat blade requires a retake. Unclear views, missing skates, poor perspective, tilted sticks and hidden landmarks should produce a retake result. AI cannot establish flex, blade lie, safety, or an exact amount to cut. This is an unvalidated beta; real photo evaluation against a coach or fitter is still needed before relying on its accuracy.

Requests are same-origin browser POSTs, JPEG data only, at most 2.2 MB, with a 30 second upstream timeout. Same-origin checks are not authentication. The Cloudflare limiter allows five requests per minute per IP per Cloudflare location; users sharing a network share this limit. This is not a global spending cap. Configure account billing controls separately. Rate limiting fails closed if unavailable. No API calls are made when the secret is missing. A live synthetic blank JPEG request succeeded after the runtime secret was configured on September 26. It returned retake, but its visual explanation hallucinated a posture. Retake feedback now uses seven structured checks with pass, fail or unclear states, visible evidence and a specific corrective action. The prompt distinguishes visible failures from uncertainty; model explanations can still be wrong. Any nonpassing check blocks a length verdict. This smoke test verifies connectivity only, not accuracy on real fitting photos.

Validation: `node --test tests/photo-api.test.mjs`; `npx wrangler deploy --dry-run`. Server files, tests, documents, configuration and secret files are excluded from static assets by .assetsignore.

Sources checked September 26, 2026:
* https://developers.cloudflare.com/workers/static-assets/binding/
* https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
* https://developers.openai.com/api/docs/guides/images-vision
* https://developers.openai.com/api/docs/models/gpt-4.1-mini
* https://developers.openai.com/api/docs/guides/your-data
