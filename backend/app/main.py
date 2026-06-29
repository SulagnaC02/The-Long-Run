from fastapi import FastAPI

app = FastAPI(
    title="The Long Run API",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "The Long Run Backend Running 🚀"
    }