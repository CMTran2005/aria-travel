import requests

def test_fetch_with_ua():
    bbox = "15.85,108.30,15.91,108.37"
    query = f"""
    [out:json][timeout:25];
    (
      node["tourism"]({bbox});
      way["tourism"]({bbox});
    );
    out body center 20;
    """
    headers = {
        "User-Agent": "AriaTravelPlanner/1.0 (contact: support@aria.local)"
    }
    endpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter",
        "https://z.overpass-api.de/api/interpreter"
    ]
    for url in endpoints:
        try:
            print(f"Trying {url} with User-Agent...")
            r = requests.post(url, data={"data": query}, headers=headers, timeout=20)
            print(f"Status: {r.status_code}")
            if r.status_code == 200:
                data = r.json().get("elements", [])
                print(f"SUCCESS! Retrieved {len(data)} POIs:")
                for el in data[:5]:
                    print(" -", el.get("tags", {}).get("name"))
                return
        except Exception as e:
            print("Err:", e)

if __name__ == "__main__":
    test_fetch_with_ua()
