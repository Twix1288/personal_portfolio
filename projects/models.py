from django.db import models

# Create your models here.
class Project(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='images/')
    url = models.URLField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.title

class Certificate(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    url = models.URLField()
    
    def __str__(self):
        return self.title