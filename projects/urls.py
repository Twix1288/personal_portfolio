from django.urls import path

from projects import views

urlpatterns = [
    path("", views.my_work, name="my_work"),
]
