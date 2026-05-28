from rest_framework import serializers
from new_app_structure.models import create_tags

class create_tagsSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = create_tags
        fields = '__all__'