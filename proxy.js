const express = require('express');

const app = express();


const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});


app.all("/api/*", function(req, res) {
  proxy.web(req, res, { target: 'http://dev-data-platform.17haoyun.cn/' }); // 目标
});

app.all("/*", function(req, res) {
  proxy.web(req, res, { target: 'http://localhost:9000' });
});

const server = app.listen(9000, function () {

  const host = server.address().address
  const port = server.address().port

  console.log("访问地址为 http://%s:%s", host, port)

})