import httpx


class BridgeError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


class BridgeClient:
    def __init__(self, port: int):
        self._client = httpx.AsyncClient(
            base_url=f"http://127.0.0.1:{port}",
            timeout=httpx.Timeout(30.0),
        )

    async def execute(self, action: str, params: dict) -> dict:
        response = await self._client.post("/execute", json={"action": action, "params": params})
        body = response.json()
        if not body.get("success"):
            err = body.get("error", {})
            raise BridgeError(code=err.get("code", "UNKNOWN"), message=err.get("message", "Unknown error"))
        return body["data"]

    async def health(self) -> bool:
        try:
            r = await self._client.get("/health")
            return r.status_code == 200
        except Exception:
            return False

    async def close(self) -> None:
        await self._client.aclose()
