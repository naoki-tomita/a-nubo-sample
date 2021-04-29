import React, { VFC } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "http";
import { readdir, readFile } from "fs/promises";
import marked from "marked";

const Index: VFC<{ list: string[] }> = ({ list }) => {
  return (
    <div>
      <h1>Markdown blog</h1>
      <ul>
        {list.map((it, i) => <li key={i}><a href={`/${it}`}>{list}</a></li>)}
      </ul>
    </div>
  );
}

async function renderIndex() {
  const template = await readFile("./index.template.html").then(it => it.toString("utf-8"));
  const mds = await readdir("./docs");
  const html = renderToString(
    <Index list={mds.map(it => it.replace(/\.md/, ""))} />
  );
  return template.replace("__BODY__", html);
}

async function renderDoc(filename: string) {
  try {
    const doc = await readFile(`./docs/${filename}.md`).then(it => it.toString("utf-8")).then(md => marked(md)).catch(() => "404")
    const template = await readFile(`./docs.template.html`).then(it => it.toString("utf-8"));
    const html = template.replace("__DOCS__", doc);
    return html;
  } catch (e) {
    throw e;
  }
}

function main() {
  const server = createServer(async (req, res) => {
    console.log(`[${Date.now()}]: Request ${req.url}`);
    try {
      if (req.url === "/") {
        res.writeHead(200, { "content-type": "text/html" }).end(await renderIndex());
        console.log(`[${Date.now()}]: Response index`);
      } else if (req.url === "/favicon.ico") {
        res.writeHead(404).end("");
        console.log(`[${Date.now()}]: Response favicon.ico`);
      } else {
        res.writeHead(200, { "content-type": "text/html" }).end(await renderDoc(req.url?.slice(1) ?? ""));
        console.log(`[${Date.now()}]: Response doc ${req.url}`);
      }
    } catch (e) {
      res.writeHead(500).end(e);
    }
  });
  server.listen(process.env.PORT)
}

main();
