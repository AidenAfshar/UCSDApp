from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseNotFound, HttpResponseRedirect
from django.http import JsonResponse

import base64
import json
import os

from google.cloud import pubsub_v1
from google.cloud import storage
from google.cloud import translate_v2 as translate
from google.cloud import vision

vision_client = vision.ImageAnnotatorClient()
translate_client = translate.Client()
publisher = pubsub_v1.PublisherClient()
storage_client = storage.Client()

project_id = "tranquil-sunup-376804"
credential_path = "/Users/aidenafshar/Documents/UCSDApp/UCSDApp/tranquil-sunup-376804-1a86726987a6.json" # Change this
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path


def detect_text_local(path):
    """Detects text in the file."""
    from google.cloud import vision
    import io
    client = vision.ImageAnnotatorClient()

    """
    For using file instead of image from camera (left for testing only)
    with io.open(path, 'rb') as image_file:
        content = image_file.read()
    """
    content = path

    image = vision.Image(content=content)

    response = client.text_detection(image=image)
    texts = response.text_annotations
    #print('Texts:')
    textAndCoords = {}

    for text in texts:
       # print('\n"{}"'.format(text.description))

        vertices = (['({},{})'.format(vertex.x, vertex.y)
                    for vertex in text.bounding_poly.vertices])

        # print('bounds: {}'.format(','.join(vertices)))

        textAndCoords[text.description] = vertices

    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))

    # Using JSON format because javascript doesn't recognize python dictionaries
    textAndCoords = json.dumps(textAndCoords) 
    
    return textAndCoords

def index(request):
    return render(request, 'ucsdapp/index.html')

def myajaxtestview(request):
    filename = request.POST['text'] # Gets the DataUrl from Javascript/ajax  
    textAndCoords = detect_text_local(filename)
    return HttpResponse(textAndCoords)