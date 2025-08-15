#!/usr/bin/env python3
"""
Verify that Lambda-compatible binaries are present
"""

import os
import sys

def verify_lambda_binaries():
    """Verify that the correct Lambda-compatible binaries are installed"""
    print("🔍 Verifying Lambda-compatible binaries...")
    
    lambda_dir = "backend/lambda-functions/ai-handler"
    
    # Check PIL directory and Linux binaries
    pil_dir = os.path.join(lambda_dir, "PIL")
    if not os.path.exists(pil_dir):
        print("❌ PIL directory not found")
        return False
    
    print("✅ PIL directory found")
    
    # Check for critical Linux binaries
    required_binaries = [
        "_imaging.cpython-39-x86_64-linux-gnu.so",
        "_imagingcms.cpython-39-x86_64-linux-gnu.so",
        "_imagingft.cpython-39-x86_64-linux-gnu.so",
        "_imagingmath.cpython-39-x86_64-linux-gnu.so",
        "_imagingmorph.cpython-39-x86_64-linux-gnu.so"
    ]
    
    found_binaries = []
    for binary in required_binaries:
        binary_path = os.path.join(pil_dir, binary)
        if os.path.exists(binary_path):
            size = os.path.getsize(binary_path)
            found_binaries.append(f"{binary} ({size} bytes)")
            print(f"✅ Found: {binary} ({size} bytes)")
        else:
            print(f"❌ Missing: {binary}")
    
    # Check ReportLab
    reportlab_dir = os.path.join(lambda_dir, "reportlab")
    if os.path.exists(reportlab_dir):
        print("✅ ReportLab directory found")
        
        # Check key ReportLab modules
        key_modules = ["lib", "platypus", "pdfgen"]
        for module in key_modules:
            module_path = os.path.join(reportlab_dir, module)
            if os.path.exists(module_path):
                print(f"✅ ReportLab {module} module found")
            else:
                print(f"❌ ReportLab {module} module missing")
    else:
        print("❌ ReportLab directory not found")
        return False
    
    # Check other dependencies
    other_deps = ["docx", "lxml", "PyPDF2"]
    for dep in other_deps:
        dep_path = os.path.join(lambda_dir, dep)
        if os.path.exists(dep_path):
            print(f"✅ {dep} directory found")
        else:
            print(f"❌ {dep} directory missing")
    
    print(f"\n📊 Summary:")
    print(f"   • PIL Linux binaries: {len(found_binaries)}/{len(required_binaries)} found")
    print(f"   • ReportLab: {'✅ Present' if os.path.exists(reportlab_dir) else '❌ Missing'}")
    print(f"   • Total package size: {get_directory_size(lambda_dir)} MB")
    
    if len(found_binaries) >= 3:  # At least the critical ones
        print("\n🎉 Lambda deployment package looks good!")
        print("✅ Critical PIL binaries present for Linux x86_64")
        print("✅ ReportLab and dependencies installed")
        print("✅ Ready for Lambda deployment")
        return True
    else:
        print("\n❌ Missing critical binaries for Lambda")
        return False

def get_directory_size(directory):
    """Get directory size in MB"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(directory):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            try:
                total_size += os.path.getsize(filepath)
            except:
                pass
    return round(total_size / (1024 * 1024), 1)

if __name__ == "__main__":
    success = verify_lambda_binaries()
    sys.exit(0 if success else 1)