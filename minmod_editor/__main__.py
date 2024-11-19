from __future__ import annotations

import typer
from loguru import logger
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.wsgi import WSGIContainer

from minmod_editor.app import app

cli = typer.Typer()


@cli.command()
def start(port: int = 8888):
    http_server = HTTPServer(WSGIContainer(app), ssl_options=None)
    http_server.listen(port)
    logger.info("Start server listening to port {}", port)
    IOLoop.instance().start()


if __name__ == "__main__":
    cli()
