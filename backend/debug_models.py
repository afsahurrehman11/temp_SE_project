import logging
import os
import sys

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def test_models():
    print("Checking environment...")
    print(f"HF_HOME: {os.environ.get('HF_HOME')}")
    print(f"TRANSFORMERS_CACHE: {os.environ.get('TRANSFORMERS_CACHE')}")
    print(f"TORCH_HOME: {os.environ.get('TORCH_HOME')}")
    
    # Unset tokens to force anonymous access
    if "HF_TOKEN" in os.environ:
        del os.environ["HF_TOKEN"]
    if "HUGGINGFACEHUB_API_TOKEN" in os.environ:
        del os.environ["HUGGINGFACEHUB_API_TOKEN"]
    
    print("\nTesting T5 download directly with transformers (Anonymous)...")
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        tokenizer = AutoTokenizer.from_pretrained("t5-small", token=False)
        model = AutoModelForSeq2SeqLM.from_pretrained("t5-small", token=False)
        print("✅ T5 Downloaded successfully")
    except Exception as e:
        print(f"❌ Failed T5: {e}")

    print("\nTesting CrossEncoder download (Anonymous)...")
    try:
        from sentence_transformers import CrossEncoder
        # CrossEncoder doesn't accept token arg directly in init easily without kwargs?
        # It uses transformers internally.
        # We'll rely on env var being unset.
        model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
        print("✅ CrossEncoder Downloaded successfully")
    except Exception as e:
        print(f"❌ Failed CrossEncoder: {e}")

if __name__ == "__main__":
    test_models()
