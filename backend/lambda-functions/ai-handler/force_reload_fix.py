import sys
import importlib

def force_module_reload():
    """Force complete reload of pdf_generator module"""
    module_name = 'pdf_generator'
    
    # Remove from sys.modules if it exists
    if module_name in sys.modules:
        del sys.modules[module_name]
    
    # Import fresh
    import pdf_generator
    return pdf_generator

# Test the reload
if __name__ == "__main__":
    pdf_gen = force_module_reload()
    print(f"Module reloaded: {pdf_gen}")
