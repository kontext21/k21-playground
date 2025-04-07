# Kontext21 Playground  

Is a simple Next.js app making use of the [k21 SDK](https://github.com/kontext21/k21) that allows you to:

1. Upload a user screen session (recorded as MP4)  
2. Send it to the k21-processor in the cloud
3. Display JSON response.

On K21 users can either upuse one of the provided samples or initiate a live screen capture. This input is then sent to the backend, which processes the received file and uploads it to a Rust-based cloud processing service. Once the processing is complete, the service returns a JSON response, which is then displayed to the user.

It's hosted at [playground.kontext21.com/](https://playground.kontext21.com/) or you can run it locally.

It's main purpose is to be used for quick experiments with the k21-processor and serve as a sample app.

![image](https://github.com/user-attachments/assets/d378b160-9551-4143-a860-89e1d7769bab)

## Features planned

- [X] Add a way to upload videos  
- [ ] PNG Upload
- [ ] Webcaputre directly in Browser
- [ ] Switch to a different processor
- [ ] Nicer UI for the JSON response
- [ ] Add [docker deployment](https://github.com/vercel/next.js/tree/canary/examples/with-docker)  

## Getting Started Locally

First, run the development server:

```bash
npm run dev
```

Note: You need to have a local k21-processor running to use the playground and change the url in the `app/page.tsx` file to `http://localhost:3000`.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This is a [Next.js](https://nextjs.org) project integrated with [PostHog](https://posthog.com/) for event-based analytics.  

## Analytics

PostHog enables tracking of user interactions, page views, and custom events while ensuring privacy and GDPR compliance.

The integration can be made through an LLM(Large Language Model) or manualy.

To integrate through LLM like Cursor or Bolt, run the following prompt in the chat:  

>Let's add PostHog to this project. We'll use the PostHog wizard to ensure the integration is handled correctly. Use this command:
>
>npx --yes @posthog/wizard@latest --default --region us
>
>Do not generate any file changes yourself. This CLI command will do all the work. Wait for it to finish and test the setup once the wizard is complete.

If you prefer manual integration, the full documentation can be found in [PostHog manual Next.js Documentation](https://posthog.com/docs/libraries/next-js).
