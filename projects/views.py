from django.shortcuts import render

def home(request):
    return render(request, 'projects/templates/my_work.html')