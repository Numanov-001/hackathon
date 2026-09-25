import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast(self, payload: dict) -> None:
        stale: list[WebSocket] = []
        message = json.dumps(payload, default=str)
        for connection in self.connections:
            try:
                await connection.send_text(message)
            except Exception:
                logger.exception("WebSocket send failed")
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)


manager = ConnectionManager()


@router.websocket("/ws/market")
async def market_feed(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
