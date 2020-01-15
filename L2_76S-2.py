import paho.mqtt.client as mqtt
import json
import urllib.parse
import urllib.request
import paho.mqtt.publish as publish
import time

### Customize Parameters
macaddrLoRa76S  = "00000000aa2c67bb"    # 8個0 + LoRa Module的macaddr    
                                        # LoRa Module的macaddr可用mac get_devaddr查詢
equipmentKeyCHT = "DKSA4XM3B94TUKUP3C"  # CHT Smart Platform上的設備金鑰
equipmentNumCHT = "17371492329"         # CHT Smart Platform上的編號

# The callback for when the client receives a CONNACK bbresponse from the server.
def on_connect(client, userdata, flags, rc):
    ### Step 1. Monitor the data of NTHU server
    print("Connected with result code ", str(rc))
    client.username_pw_set("nthuhsnl_lora","89957463")
    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    client.subscribe("#")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    msg_list = msg.payload.decode('utf8').replace("'", '"') # msg_list type is str

    if (msg_list=='world'): w = msg_list
    else:
        msg_str = msg_list.strip('[]') # a type is str
        msg = json.loads(msg_str) # msg type is dic #msg is all data
        gwid = msg["gwid"]
        # print(msg)

        if((gwid != '0000f835ddfd5639')):
            data = msg["data"]
            inmacaddress = msg["macAddr"]

            if(inmacaddress==macaddrLoRa76S):
                print("     "+data)

                ### Step 2. Decode
                airtemp = str(data[0:2] + "." + data[2:4])
                
                airhum  = str(data[4:6] + "." + data[6:8])
                whattime = time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime())

                ### Step 3. Publish to CHT Smart Platform
                host = "iot.cht.com.tw"
                auth = {'username': equipmentKeyCHT, 'password': equipmentKeyCHT}
                topic = "/v1/device/" + equipmentNumCHT + "/rawdata"
                payload ='[{ "id": "airtemp", "time": "'+ whattime +'","value": [ "'+ airtemp +'"]},{"id": "airhum", "time": "'+ whattime +'","value": ["'+ airhum +'"]}]'
                clientID = "4b2ca1c9c5cb8fe715c36f"
                publish.single(topic,payload, qos=0, hostname=host,auth=auth)

                # debug
                print("")
                print(whattime)
                print(data)
                print("AIRTEMP ", airtemp)
                print("AIRHUM  ", airhum)
                print(payload)

# Main
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect("104.199.215.165", 1883, 60) # Plz do not modify it
client.loop_forever()

