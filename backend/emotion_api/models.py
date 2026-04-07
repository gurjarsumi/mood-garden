from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    content = models.TextField(blank=True)
    stress_score = models.FloatField(default=0.0)
    dominant_emotion = models.CharField(max_length=50, default="neutral")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Entry on {self.created_at.strftime('%Y-%m-%d')} - {self.dominant_emotion}"

    class Meta:
        ordering = ['-created_at']
    

