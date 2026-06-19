import streamlit as st
import requests
from PIL import Image
import io

API_URL = "http://127.0.0.1:8000/search"

st.set_page_config(page_title="Face Search Engine", layout="wide")

# 🔥 Hover effect
st.markdown("""
<style>
img {
    border-radius: 12px;
    transition: transform 0.25s ease;
}
img:hover {
    transform: scale(1.05);
}
</style>
""", unsafe_allow_html=True)

st.title("🔍 Face Search Engine")

uploaded_file = st.file_uploader("Upload Image", type=["jpg", "jpeg", "png"])

if uploaded_file:

    image = Image.open(uploaded_file)

    st.subheader("📸 Uploaded Image")
    st.image(image, width=260)

    # Convert image
    img_bytes = io.BytesIO()
    image.save(img_bytes, format="JPEG")

    files = {"file": img_bytes.getvalue()}

    with st.spinner("Searching..."):
        response = requests.post(API_URL, files=files)
        data = response.json()

    matches = data.get("matches", [])

    st.subheader("🎯 Matching Images")

    if not matches:
        st.warning("No matches found")

    else:
        num_cols = 5
        target_size = (300, 220)  # 🔥 FIXED SIZE

        for i in range(0, len(matches), num_cols):
            cols = st.columns(num_cols)

            for j in range(num_cols):
                if i + j < len(matches):
                    item = matches[i + j]

                    try:
                        img = Image.open(item["image"])

                        # 🔥 RESIZE + CROP (IMPORTANT)
                        img = img.resize(target_size)

                        with cols[j]:
                            st.image(img, use_container_width=True)

                            similarity = item["similarity"] * 100
                            st.caption(f"{similarity:.1f}%")

                    except:
                        continue