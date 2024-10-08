import { http, HttpResponse } from 'msw';

const localHostAndPort = 'localhost:443/v1';
export const LOCAL_AI_ADDR = `http://${localHostAndPort}`;

function loadTestFixture(filePathFromFixturesDir: string) {
  return require(`${__dirname}/${filePathFromFixturesDir}`);
}

export const handlers = [
  http.post(`${LOCAL_AI_ADDR}/chat/completions`, () => {
    const textEncoder = new TextEncoder();
    const mockData = loadTestFixture('chatResponse.json');

    const stream = new ReadableStream({
      start(controller) {
        mockData.forEach((chunk: any) => {
          controller.enqueue(
            textEncoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
          );
        });
        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }),
];
