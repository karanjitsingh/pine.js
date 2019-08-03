import sys
import os
from os import path
import re
import json

folder =  os.path.join("data", "BINANCE_BTCUSDT") if len(sys.argv) == 1 else sys.argv[1]

dumpPath = os.path.join(os.getcwd(), folder)

dumpJsons = list(filter(lambda file: re.match("^\d{4}-\d{2}-\d{2}\.json$", file), os.listdir(dumpPath)))

for i in range(len(dumpJsons)):
    with open(path.join(dumpPath, dumpJsons[i]), "r") as file:
        content = file.read()

    print(dumpJsons[i])

    data = json.loads(content)

    print(len(data))