from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0001_initial"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="Projects",
            new_name="Project",
        ),
        migrations.RenameModel(
            old_name="Certificates",
            new_name="Certificate",
        ),
    ]
