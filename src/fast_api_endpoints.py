import os
from pathlib import Path

from dotenv import load_dotenv
from eyepop import EyePopSdk
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from fastai.vision.all import PILImage, load_learner


load_dotenv()  # by default, looks for .env in the current directory

pop_id = os.getenv("EYEPOP_POP_ID")
secret_key = os.getenv("EYE_POP_AI_API_KEY")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


class ImageInput(BaseModel):
    img_url: str


@app.post("/predict")
async def predict_image(input: ImageInput):
    try:
        with EyePopSdk.workerEndpoint(pop_id=pop_id, secret_key=secret_key) as endpoint:
            result = endpoint.load_from(input.img_url).predict()
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ClassifyInputImage(BaseModel):
    image: str  # Base64 encoded image string


@app.post("/classify")
async def classify(input: ClassifyInputImage):
    # Decode base64 image
    import base64
    from io import BytesIO

    root_dp = Path()
    learn = load_learner(root_dp / "models" / "homeless_classifier.pkl")

    image_data = base64.b64decode(input.image)
    image_bytes = BytesIO(image_data)

    # Create PILImage from bytes - this was missing!
    pil_image = PILImage.create(image_bytes)

    labels = learn.dls.vocab
    res, idx, prob = learn.predict(pil_image)  # Pass PILImage, not bytes

    return dict(zip(labels, map(float, prob)))
