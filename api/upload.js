import { handleUpload } from '@vercel/blob/client';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname /*, clientPayload */) => {
        // Generate a client token for the browser to upload the file
        // 允许上传任何文件，但在生产环境中应该做鉴权
        // e.g. check if request.headers.get('cookie') contains a valid session
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          tokenPayload: JSON.stringify({
            // optional payload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Upload completed, here you can save the blob.url to your database if needed
        // but we are doing it from the client side for this app
        console.log('blob uploaded', blob.url);
      },
    });

    return new Response(JSON.stringify(jsonResponse), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}
