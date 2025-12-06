import os
import sys

# Simulate the exact scenario in rag_service.py
print("Testing environment variable manipulation...")

# Set a fake token for testing (use placeholder, not real token)
os.environ["HUGGINGFACEHUB_API_TOKEN"] = "hf_placeholder_token_for_testing"
print(f"Before: HUGGINGFACEHUB_API_TOKEN = {os.environ.get('HUGGINGFACEHUB_API_TOKEN')}")

# Unset it
old_token = os.environ.get("HUGGINGFACEHUB_API_TOKEN")
if old_token:
    del os.environ["HUGGINGFACEHUB_API_TOKEN"]

print(f"After delete: HUGGINGFACEHUB_API_TOKEN = {os.environ.get('HUGGINGFACEHUB_API_TOKEN')}")

# Try to load CrossEncoder
try:
    from sentence_transformers import CrossEncoder
    print("Attempting to load CrossEncoder...")
    model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
    print("✅ CrossEncoder loaded successfully!")
except Exception as e:
    print(f"❌ Failed: {e}")
