import WebSocket, { WebSocketServer } from 'ws';
const port = 4021;
// const wss = new WebSocketServer({ port });
const wss = new WebSocketServer({ port, host: '0.0.0.0' });

// Store active connections
const peers = new Map<string, WebSocket>();

wss.on('connection', (ws: WebSocket, req) => {
    let userId: string | null = null;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
    console.log(`New connection from ${ip}`);
    // console.log(req);

    ws.on('message', (message: string) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'register':
                userId = data.userId;
                peers.set(userId, ws);

                // Send list of existing peers to new user
                const activePeers = Array.from(peers.keys()).filter(id => id !== userId);
                ws.send(JSON.stringify({
                    type: 'peers',
                    peers: activePeers
                }));

                // Notify other peers about new user
                broadcast({
                    type: 'peer-joined',
                    userId: userId
                }, userId);
                break;

            case 'offer':
            case 'answer':
            case 'ice-candidate':
                // Forward signaling messages to specific peer
                const targetPeer = peers.get(data.target);
                if (targetPeer) {
                    targetPeer.send(JSON.stringify({
                        type: data.type,
                        data: data.data,
                        from: userId
                    }));
                }
                break;
        }
    });

    ws.on('close', () => {
        if (userId) {
            peers.delete(userId);
            broadcast({
                type: 'peer-left',
                userId: userId
            });
        }
    });

    ws.on('error', console.error);
});

function broadcast(message: any, excludeId: string | null = null) {
    peers.forEach((peer, id) => {
        if (id !== excludeId) {
            peer.send(JSON.stringify(message));
        }
    });
}

console.log(`Signaling server running on port ${port}`);
