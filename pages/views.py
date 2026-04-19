from django.shortcuts import render

# Create your views here.

def home(request):
    return render(request, 'pages/templates/landing_page.html')

def about_me(request):
    return render(request, 'pages/templates/about_me.html')

def resume(request):
    return render(request, 'pages/templates/resume.html')