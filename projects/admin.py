from django.contrib import admin
from .models import Project, Certificate


class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "url")


class CertificateAdmin(admin.ModelAdmin):
    list_display = ("title", "url")


admin.site.register(Project, ProjectAdmin)
admin.site.register(Certificate, CertificateAdmin)
