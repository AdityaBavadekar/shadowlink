import os
if os.getenv("DISPLAY") is None:
    print("0")
    exit(-1)
import pyscreenshot
pyscreenshot.grab().save("captures/screenshot.png")
print("1")