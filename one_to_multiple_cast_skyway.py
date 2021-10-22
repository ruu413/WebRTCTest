# WebRTCで1->複数に配信する
# 1人がsender

import asyncio
import websockets
import json
import ssl
import pathlib
address = "127.0.0.1"
cert = "C://Users/asika/OneDrive/ドキュメント/webRTC/vscode_live_server.cert.pem"
key = "C://Users/asika/OneDrive/ドキュメント/webRTC/vscode_live_server.key.pem"


port = 8081
connection_num = 0
connections = []
sender_address = "127.0.0.1"
sender_socket = None
peer_id = None
print("a")
# 後で通信している個人が本物か見分けるのもじっそうしないといけないきがする


# offerer == receiver
# answerer == sender

# 受信コールバック


async def server(websocket, path):
    global connection_num, connections, sender_socket, peer_id
    remote_address = websocket.remote_address
    print(remote_address)
    connections.append(websocket)
    while True:
        # 受信
        try:
            received_packet = await websocket.recv()
        except:
            break
        dictionary = json.loads(received_packet)
        promises = []
        msg_type = dictionary["msg_type"]
        if msg_type == "connect_sender":
            if websocket.remote_address[0] == sender_address:
                if sender_socket is None:
                    print("sender_connect")
                    sender_socket = websocket
                    peer_id = dictionary["peer_id"]
                else:
                    pass
                    sender_socket = websocket
                    peer_id = dictionary["peer_id"]
                    # TODO senderの再接続時通信切り替えしたいよね
        elif msg_type == "connect_receiver":

            if sender_socket is not None:
                print("send")
                print(sender_socket)
                promise = websocket.send(
                    json.dumps({
                        "msg_type": "connect_receiver",
                        "peer_id": peer_id
                    }))
                promises.append(promise)
        print("{}: {}".format(path, dictionary))
        for p in promises:
            a = await p
            print(a)
    if remote_address == sender_socket.remote_address:
        peer_id = None
        sender_socket = None
    else:
        pass

    connections.remove(websocket)


ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(cert, keyfile=key)

start_server = websockets.serve(server, address, port, ssl=ssl_context)
# サーバー立ち上げ
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
