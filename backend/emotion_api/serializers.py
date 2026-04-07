from rest_framework import serializers
from .models import JournalEntry

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ['id','content','stress_score','dominant_emotion','created_at','created_at']
        read_only_fields = ['id', 'created_at']
        
