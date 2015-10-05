from django.shortcuts import render

def robot(request):
  return render(request, "robot.html", locals())
