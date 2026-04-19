from django.urls import path
from pages import views

urlpatterns = [
    path("", views.home, name="home"),
    path("about/", views.about_me, name="about"),
    path("resume/", views.resume, name="resume"),
]