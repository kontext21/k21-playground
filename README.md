This is Kontext21 Playground. It's a simple Next.js app that allows you to 
1. Upload a user screen session (recorded as MP4)
2. Send it to the k21-processor in the cloud
3. Display JSON response.

On K21 users can either upload a pre-recorded MP4 file or initiate a live screen capture. This input is then sent to the backend, which processes the received file and uploads it to a Rust-based cloud processing service. Once the processing is complete, the service returns a JSON response, which is then displayed to the user.

It's hosted at [playground.kontext21.com/](https://playground.kontext21.com/) or you can run it locally.

It's main purpose is to be used for quick experiments with the k21-processor and serve as a sample app.

![image](https://github.com/user-attachments/assets/8b13db47-a71d-48a4-92bc-2c98e052c767)


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

Note: You need to have a local k21-processor running to use the playground and change the url in the `app/page.tsx` file to `http://localhost:3001`.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This is a [Next.js](https://nextjs.org) project.
