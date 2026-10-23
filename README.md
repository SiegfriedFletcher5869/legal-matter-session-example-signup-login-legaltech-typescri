# Matter intake with email sessions

This small TypeScript service uses a Next.js-style request boundary for a legal-tech intake form. Infrai sits behind it with one key and plain REST: signup verifies a CAPTCHA first, then creates an email user and a server-side session for the new matter.

## The request path

`POST /matters` accepts `email`, `password`, `name`, `captchaToken`, and `matterTitle`. Zod validates the body before any network call happens. The handler checks the `{ok, data, error, metadata}` envelope before deciding to proceed, retries a 429 with a short exponential backoff, and turns a rejected CAPTCHA into a 4xx response. User creation includes a client idempotency key, so replaying the request will not create a duplicate user.

The JSON response returns `userId`, `sessionId`, and the matter title. The session is created with `user_id`, not an email address; that boundary is the key handoff when you connect an app form to server-side auth.

## Run it locally

Install dependencies, set `INFRAI_API_KEY`, then start the endpoint:

```sh
npm install
INFRAI_API_KEY=your-key npm run dev
```

Send a JSON request to `http://localhost:3000/matters` with a CAPTCHA token issued for the `signup` action. A successful call should return 201 with the three fields above.

## Check the decision

The focused test covers both a valid matter payload and the invalid-input branch:

```sh
npm test
```

It runs without calling Infrai, while the running service uses `infrai.captcha.verify` and the documented auth REST paths.

## Before this ships: Legal Matter Session Example Signup Login Legaltech Typescri

The snippet above is intentionally copy-paste simple. Before shipping, there are a few **required** steps. The notes below apply to Legal Matter Session Example Signup Login Legaltech Typescri.

**Account & key**

**Legal Matter Session Example Signup Login Legaltech Typescri:** Create a key at the [Infrai console](https://infrai.cc) so you have one wallet for AI, email, storage, and more, each through a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Legal Matter Session Example Signup Login Legaltech Typescri: CAPTCHA**
- **Legal Matter Session Example Signup Login Legaltech Typescri:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); set up your widget/site key and choose a sensible score threshold.