import os
if os.getenv("DISPLAY") != ":1":
    print("0")
    exit(-1)
import cv2
cam = cv2.VideoCapture(0)
captured, img = cam.read()
if captured: cv2.imwrite("captures/webcam_capture.png", img)
print("1")