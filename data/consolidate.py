import sys
import os
from os import path
import re
import json

folder =  os.path.join("data", "BINANCE_BTCUSDT") if len(sys.argv) == 1 else sys.argv[1]

dumpPath = os.path.join(os.getcwd(), folder)

dumpJsons = list(filter(lambda file: re.match("^\d{4}-\d{2}-\d{2}\.[12]\.json$", file), os.listdir(dumpPath)))

print(dumpJsons)

consolidatedData = []

for i in range(len(dumpJsons)):
    with open(path.join(dumpPath, dumpJsons[i]), "r") as file:
        content = file.read()

    data = json.loads(content)

    consolidatedData = consolidatedData + data

print(consolidatedData)