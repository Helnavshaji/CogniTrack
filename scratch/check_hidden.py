import os

path = "c:\\Users\\ADMIN\\cognitive-health-ai"
print("Items in workspace including hidden:")
for x in os.listdir(path):
    print(x)
