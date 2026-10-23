import requests
import json
import sys

# Set UTF-8 encoding for Windows terminal output
sys.stdout.reconfigure(encoding='utf-8')

def test_ai_plan():
    payload = {
        "user_prompt": "Tôi muốn đi du lịch Hội An 2 ngày cùng bạn gái, thích ăn vặt đường phố và chụp ảnh quán cafe đẹp, ngân sách khoảng 60 USD",
        "city": "Hội An"
    }
    print("Sending AI Plan Request...")
    res = requests.post("http://127.0.0.1:8000/api/trips/plan", json=payload, timeout=20)
    print("Status:", res.status_code)
    try:
        print("Response JSON:", json.dumps(res.json(), indent=2, ensure_ascii=False))
    except Exception:
        print("Raw Response:", res.text)

if __name__ == "__main__":
    test_ai_plan()
