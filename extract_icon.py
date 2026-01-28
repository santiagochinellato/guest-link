import re
import base64

input_file = "public/hostlyhorizontal.svg"
output_file = "public/hostly-icon.svg"

try:
    with open(input_file, "r") as f:
        content = f.read()

    # Find the base64 string inside href="data:image/svg+xml;base64,..."
    # Pattern looks for href="data:image/svg+xml;base64,([^"]+)"
    match = re.search(r'href="data:image/svg\+xml;base64,([^"]+)"', content)

    if match:
        b64_data = match.group(1)
        # Decode base64
        decoded_data = base64.b64decode(b64_data).decode("utf-8")
        
        with open(output_file, "w") as f:
            f.write(decoded_data)
        
        print(f"Successfully extracted icon to {output_file}")
    else:
        print("Could not find base64 SVG data in input file.")

except Exception as e:
    print(f"Error: {e}")
