# Sumchin — Higgsfield Seedance 2.5

Server-side TypeScript example for Higgsfield Seedance 2.5 text-to-video.

## Local setup

1. Run `npm install`.
2. Create `.env.local` locally and add `HF_CREDENTIALS=KEY_ID:KEY_SECRET`.
3. Run `npm start`.

Never commit `.env.local` or expose Higgsfield credentials in browser-side code.

The example requests a 5-second, 720p, 16:9 video with the prompt “A cinematic scene at sunset” and prints the generated video URL only after a completed request.
