import React, { VFC } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "http";
import { readdir, readFile } from "fs/promises";
import marked from "marked";

const Index: VFC<{ list: string[] }> = ({ list }) => {
  return (
    <div>
      <ul>
        {list.map(it => <li>{list}</li>)}
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
  const doc = await readFile(`./docs/${filename}.md`).then(it => it.toString("utf-8")).then(md => marked(md));
  const template = await readFile(`./docs.template.html`).then(it => it.toString("utf-8"));
  const html = template.replace("__DOCS__", doc);
  return html;
}



function main() {
  const server = createServer(async (req, res) => {
    try {
      if (req.url === "/") {
        res.writeHead(200, { "content-type": "text/html" }).end(await renderIndex());
      } else {
        res.writeHead(200, { "content-type": "text/html" }).end(await renderDoc(req.url?.slice(1) ?? ""));
      }
    } catch (e) {
      res.writeHead(200).end(e);
    }
  });
  server.listen(process.env.PORT)
}

main();
