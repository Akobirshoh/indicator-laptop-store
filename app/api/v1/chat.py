from fastapi import APIRouter, WebSocket, WebSocketDisconnect [cite: 154]

router = APIRouter()

class ConnectionManager: [cite: 157]
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket) [cite: 159]

manager = ConnectionManager()

@router.websocket("/ws/{client_id}") [cite: 155]
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Логика отправки сообщения продавцу [cite: 158]
            await websocket.send_text(f"Message from {client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)