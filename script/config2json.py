import os
import sys
import json

fileObject = open("file.txt")

count = 0

res = dict()
for line in fileObject.readlines():
    count += 1
    if count%3==1:
        # print line
        arr = line.split(" ")
        name = arr[1]
        arr[-1] = arr[-1].split("\n")[0]
        eg = arr[4:]
        string = ""
        for i in eg:
            string += i+" "
        # print name+":"+string
        res[name] = string
print json.dumps(res)
