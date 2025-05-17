import requests
import time

def get_ngrok_url():
    ngrok_api_url = "http://localhost:4040/api/tunnels"
    success = False
    while not success:
        try:
            response = requests.get(ngrok_api_url)
            if response.status_code == 200:
                tunnels = response.json().get('tunnels', [])
                if tunnels:
                    public_url = tunnels[0]['public_url']
                    return public_url
        except:
            print("ngrok is not running yet, retrying in 1 seconds...")
            time.sleep(1)
    return None


def send_url(x):
    files = {
        "message": (None, x)
    }
    # todo add your endpoint or maybe use telegram or similar api
    response = requests.post('https://xxxxx.vercel.app/api/send', files=files)
    if response.status_code == 200:
        print("URL sent successfully!")
    else:
        print("Failed to send URL", response.json())


if __name__ == "__main__":
    time.sleep(4)
    ngrok_url = get_ngrok_url()
    if ngrok_url:
        send_url(f"WHATISMYSTATUS ngrok public URL: {ngrok_url}")
    else:
        print("Failed to get ngrok URL.")
