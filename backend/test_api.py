"""
Test script for ResumeMatch API
Run this to verify the API is working correctly
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"
API_V1 = f"{BASE_URL}/api/v1"


def print_response(response: requests.Response, title: str):
    """Pretty print response"""
    print(f"\n{'=' * 60}")
    print(f"🧪 {title}")
    print(f"{'=' * 60}")
    print(f"Status: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")


def test_health_check():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print_response(response, "Health Check")
    return response.status_code == 200


def test_register_user():
    """Test user registration"""
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    response = requests.post(f"{API_V1}/auth/register", json=user_data)
    print_response(response, "User Registration")
    return response.status_code in [200, 201, 400]  # 400 if user exists


def test_login():
    """Test user login"""
    login_data = {
        "username": "test@example.com",
        "password": "testpass123"
    }
    
    response = requests.post(
        f"{API_V1}/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    print_response(response, "User Login")
    
    if response.status_code == 200:
        token = response.json().get("access_token")
        return token
    return None


def test_get_current_user(token: str):
    """Test get current user"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_V1}/auth/me", headers=headers)
    print_response(response, "Get Current User")
    return response.status_code == 200


def test_create_job(token: str):
    """Test creating a job"""
    headers = {"Authorization": f"Bearer {token}"}
    job_data = {
        "title": "Senior Python Developer",
        "description": "We are looking for an experienced Python developer",
        "requirements": {
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "experience": "5+ years",
            "education": "Bachelor's degree in Computer Science"
        },
        "status": "active"
    }
    
    response = requests.post(f"{API_V1}/jobs/", json=job_data, headers=headers)
    print_response(response, "Create Job")
    
    if response.status_code in [200, 201]:
        return response.json().get("id")
    return None


def test_get_jobs(token: str):
    """Test getting jobs"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_V1}/jobs/", headers=headers)
    print_response(response, "Get Jobs")
    return response.status_code == 200


def test_analytics_dashboard(token: str):
    """Test analytics dashboard"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_V1}/analytics/dashboard", headers=headers)
    print_response(response, "Analytics Dashboard")
    return response.status_code == 200


def test_chat_query(token: str):
    """Test chat query"""
    headers = {"Authorization": f"Bearer {token}"}
    query_data = {
        "query": "What is the average experience required?",
        "top_k": 3
    }
    
    response = requests.post(f"{API_V1}/chat/query", json=query_data, headers=headers)
    print_response(response, "Chat Query")
    return response.status_code == 200


def run_all_tests():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("🚀 Starting ResumeMatch API Tests")
    print("=" * 60)
    
    results = {}
    
    # Test health check
    results["Health Check"] = test_health_check()
    
    # Test registration
    results["User Registration"] = test_register_user()
    
    # Test login
    token = test_login()
    results["User Login"] = token is not None
    
    if not token:
        print("\n❌ Login failed. Cannot continue with authenticated tests.")
        print_results(results)
        return
    
    # Test authenticated endpoints
    results["Get Current User"] = test_get_current_user(token)
    
    job_id = test_create_job(token)
    results["Create Job"] = job_id is not None
    
    results["Get Jobs"] = test_get_jobs(token)
    results["Analytics Dashboard"] = test_analytics_dashboard(token)
    results["Chat Query"] = test_chat_query(token)
    
    # Print summary
    print_results(results)


def print_results(results: Dict[str, bool]):
    """Print test results summary"""
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print("\n" + "=" * 60)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 All tests passed! API is working correctly.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the output above.")


if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the API server.")
        print("Make sure the server is running:")
        print("  uvicorn app.main:app --reload")
    except Exception as e:
        print(f"\n❌ Error: {e}")
