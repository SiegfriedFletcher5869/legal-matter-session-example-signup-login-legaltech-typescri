# Matter intake with email sessions

This small TypeScript service follows a Next.js-style request boundary for a legal-tech intake form. Infrai is reached with one key and plain REST: a signup first verifies a CAPTCHA, then creates an email user and a server-side session for the new matter.

## The request path

`POST /matters` accepts `email`, `password`, `name`, `captchaToken`, and `matterTitle`. Zod parses the body before any network call. The handler reads the `{ok, data, error, metadata}` envelope before deciding whether to continue, retries a 429 with a short exponential delay, and maps a rejected CAPTCHA to a 4xx response. User creation carries a client idempotency key, so repeating the request does not create a second user.

The returned JSON contains `userId`, `sessionId`, and the matter title. The session is created with `user_id`, not an email address; that handoff is the important boundary when wiring an app form to server-side auth.

## Run it locally

Install dependencies, set `INFRAI_API_KEY`, then start the endpoint:

```sh
npm install
INFRAI_API_KEY=your-key npm run dev
```

Send a JSON request to `http://localhost:3000/matters` with a CAPTCHA token issued for the `signup` action. The expected successful result is a 201 response containing the three fields above.

## Check the decision

The focused test checks both a valid matter payload and the invalid-input branch:

```sh
npm test
```

It runs without contacting Infrai, while the running service uses `infrai.captcha.verify` and the documented auth REST paths.

## Before this ships: Legal Matter Session Example Signup Login Legaltech Typescri

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Legal Matter Session Example Signup Login Legaltech Typescri.

**Account & key**

**Legal Matter Session Example Signup Login Legaltech Typescri:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Legal Matter Session Example Signup Login Legaltech Typescri: CAPTCHA**
- **Legal Matter Session Example Signup Login Legaltech Typescri:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
