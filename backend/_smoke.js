// Final smoke test: login endpoint + a create-with-image via raw multipart (browser-equivalent).
const http = require('http');
const app = require('./server.js');
const server = http.createServer(app);

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC', 'base64');
const boundary = '----finaltest';
const json = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return { raw: t }; } };

(async () => {
    await new Promise(r => server.listen(0, r));
    const base = 'http://127.0.0.1:' + server.address().port;

    try {
        // login correct
        const lr = await fetch(base + '/api/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'ulatair69@' })
        });
        console.log('LOGIN correct :', lr.status, JSON.stringify(await lr.json()));

        // login wrong
        const lr2 = await fetch(base + '/api/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'nope' })
        });
        console.log('LOGIN wrong  :', lr2.status, JSON.stringify(await lr2.json()));

        // create project with image (raw multipart = browser-equivalent)
        const body = Buffer.concat([
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nFinal Test\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\ndesc\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="link"\r\n\r\nhttps://x.test\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="f.png"\r\nContent-Type: image/png\r\n\r\n`),
            PNG,
            Buffer.from(`\r\n--${boundary}--\r\n`)
        ]);
        const cr = await fetch(base + '/api/projects', {
            method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary }, body
        });
        const cj = await json(cr);
        console.log('CREATE+image:', cr.status, cj.success, 'images=', (cj.data && cj.data.images && cj.data.images.length));
        const id = cj.data && cj.data.id;

        const dr = await fetch(base + '/api/projects/' + id, { method: 'DELETE' });
        console.log('DELETE       :', dr.status, (await dr.json()).success);
    } catch (e) {
        console.error('FAIL:', e.message);
    } finally {
        server.close(); process.exit(0);
    }
})();
