const WebSocket = require('ws');
const port = 3000;
const wss = new WebSocket.Server({ port });

// Store only initial peers for bootstrapping
const initialPeers = new Map();

wss.on('connection', (ws) => {
    let userId = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'register':
                userId = data.userId;
                initialPeers.set(userId, ws);
                
                // Send a few random peers to help bootstrap the network
                const availablePeers = Array.from(initialPeers.keys())
                    .filter(id => id !== userId)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3); // Send up to 3 random peers

                ws.send(JSON.stringify({
                    type: 'initial-peers',
                    peers: availablePeers
                }));
                break;
                
            case 'ice-candidate':
            case 'offer':
            case 'answer':
                // Forward signaling messages only during initial connection
                const targetPeer = initialPeers.get(data.target);
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
            initialPeers.delete(userId);
        }
    });
});

console.log(`Discovery server running on port ${port}`);
