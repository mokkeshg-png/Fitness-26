import requests
import os
from dotenv import load_dotenv
import time

load_dotenv()

# Configuration
BACKEND_URL = f"http://localhost:{os.getenv('PORT', '8000')}"
SUPABASE_URL = os.getenv("SUPABASE_URL")

def print_banner():
    print("\n" + "="*50)
    print("   🚀 FITTRACK SYSTEM CONNECTIVITY CHECKER   ")
    print("="*50 + "\n")

def check_backend():
    print(f"[*] Checking Python Backend ({BACKEND_URL})...", end="", flush=True)
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(" ✅ ONLINE")
            print(f"    - API Status: {data.get('api_status', 'N/A')}")
            print(f"    - Supabase Connectivity: {data.get('supabase_connection', 'N/A')}")
            return True
        else:
            print(f" ❌ ERROR (Status {response.status_code})")
    except requests.exceptions.ConnectionError:
        print(" ❌ OFFLINE (Is the backend running?)")
    except Exception as e:
        print(f" ❌ ERROR: {str(e)}")
    return False

def check_supabase_direct():
    print(f"[*] Checking Supabase URL ({SUPABASE_URL})...", end="", flush=True)
    try:
        # Check if the URL is reachable
        response = requests.get(f"{SUPABASE_URL}/rest/v1/", timeout=5)
        if response.status_code in [200, 401]: # 401 is expected if no key is provided, but it means server is up
            print(" ✅ REACHABLE")
            return True
        else:
            print(f" ❌ UNREACHABLE (Status {response.status_code})")
    except Exception as e:
        print(f" ❌ ERROR: {str(e)}")
    return False

def check_frontend_config():
    print("[*] Checking Frontend Configuration (js/api.js)...", end="", flush=True)
    api_js_path = os.path.join("..", "js", "api.js")
    if os.path.exists(api_js_path):
        with open(api_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if "BACKEND_URL" in content and SUPABASE_URL in content:
                print(" ✅ CONFIGURED")
                return True
            else:
                print(" ⚠️ MISCONFIGURED (Missing URL or Backend Link)")
    else:
        print(" ❌ FILE MISSING")
    return False

def main():
    print_banner()
    
    s1 = check_backend()
    s2 = check_supabase_direct()
    s3 = check_frontend_config()
    
    print("\n" + "="*50)
    if s1 and s2 and s3:
        print(" 🎉 SUCCESS: Everything is syncronized correctly!")
    else:
        print(" ⚠️ WARNING: Some components are not connected correctly.")
        print("    Please follow the troubleshooting steps below.")
    print("="*50)
    
    if not s1:
        print("\n[!] TO FIX BACKEND:")
        print("    1. cd backend")
        print("    2. pip install -r requirements.txt")
        print("    3. python main.py")
    
    if not s2:
        print("\n[!] TO FIX SUPABASE:")
        print("    - Check your internet connection.")
        print("    - Verify SUPABASE_URL in backend/.env")

    print("\nDone.")

if __name__ == "__main__":
    main()
