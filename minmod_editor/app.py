from __future__ import annotations

import os

import requests
from flask import (
    Flask,
    Response,
    jsonify,
    render_template,
    request,
    send_from_directory,
)
from loguru import logger
from werkzeug.exceptions import HTTPException

MINMOD_API = os.environ.get("MINMOD_API", "https://minmod.isi.edu")
assert not MINMOD_API.endswith("/"), MINMOD_API
logger.info("Proxying requests to the server: {}", MINMOD_API)

pkg_dir = os.path.dirname(__file__)

app = Flask(
    __name__,
    template_folder=os.path.join(pkg_dir, "www"),
    static_folder=os.path.join(pkg_dir, "www/static"),
    static_url_path="/editor/static",
)
app.config["app.json.sort_keys"] = False


# https://stackoverflow.com/questions/6656363/proxying-to-another-web-service-with-flask
@app.route("/api/", defaults={"path": ""})
@app.route("/api/<path:path>", methods=["GET", "POST", "PUT", "DELETE"])
def forward_request(
    path,
):
    res = requests.request(  # ref. https://stackoverflow.com/a/36601467/248616
        method=request.method,
        url=request.url.replace(request.host_url, f"{MINMOD_API}/"),
        headers={
            k: v for k, v in request.headers if k.lower() != "host"
        },  # exclude 'host' header
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False,
        timeout=None,
    )

    # region exlcude some keys in :res response
    excluded_headers = [
        "content-encoding",
        "content-length",
        "transfer-encoding",
        "connection",
    ]  # NOTE we here exclude all "hop-by-hop headers" defined by RFC 2616 section 13.5.1 ref. https://www.rfc-editor.org/rfc/rfc2616#section-13.5.1
    headers = [
        (k, v) for k, v in res.raw.headers.items() if k.lower() not in excluded_headers
    ]
    # endregion exlcude some keys in :res response

    response = Response(res.content, res.status_code, headers)
    return response


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def home(path):
    if path.find("/") == -1 and path.find(".") != -1:
        if path.endswith(".json") or path.endswith(".ico") or path.endswith(".png"):
            return send_from_directory(app.template_folder, path)  # type: ignore

    return render_template("index.html")


@app.errorhandler(HTTPException)
def handle_exception(e):
    """Return JSON instead of HTML for HTTP errors."""
    return (
        jsonify(
            {
                "status": "error",
                "message": str(e),
            }
        ),
        e.code,
    )


app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # maximum upload of 16 MB
