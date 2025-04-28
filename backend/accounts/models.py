from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('user', 'Regular User'),
        ('police', 'Police Officer'),
        ('admin', 'Admin'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='user')
    phone = models.CharField(
        max_length=15,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$')],
        blank=True,
        null=True
    )
    department = models.ForeignKey('reports.PoliceDepartment', on_delete=models.SET_NULL, null=True, blank=True)
    badge_number = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_user_type_display()})"