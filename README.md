This is Kontext21 Playground. It's a simple Next.js app that allows you to 
1. Upload a user screen session (recorded as MP4)
2. Send it to the k21-processor in the cloud
3. Display JSON response.

It's hosted at [playground.kontext21.com/](https://playground.kontext21.com/) or you can run it locally.

It's main purpose is to be used for quick experiments with the k21-processor and serve as a sample app.

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This is a [Next.js](https://nextjs.org) project.
