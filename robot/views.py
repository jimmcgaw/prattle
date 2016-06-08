from django.shortcuts import render
from django.http import JsonResponse

import json
import urllib2
import urllib

def robot(request):
  return render(request, "robot.html", locals())


def natural(request):
  return render(request, "natural.html", locals())

def marinedata(request):
  url = 'http://api.worldweatheronline.com/free/v2/marine.ashx?q=34.373,-119.478&key=8e218b0c1fec5abe6d0296e4ab638&format=json'
  data = urllib2.urlopen(url).read()
  return JsonResponse(json.loads(data))