from rest_framework import serializers

from new_app_structure.models import register



class register_serializer(serializers.ModelSerializer):
    class Meta:
        model = register
        fields = '__all__'
