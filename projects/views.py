from django.shortcuts import render
from django.db.models import F

from .models import Certificate, Project


def my_work(request):
    projects = Project.objects.all().order_by(F("end_date").desc(nulls_first=True))
    certificates = Certificate.objects.all().order_by("-id")
    return render(
        request,
        "my_work.html",
        {
            "projects": projects,
            "certificates": certificates,
        },
    )
