from rest_framework import serializers
from new_app_structure.models import create_MRF


class mrf_Serializer(serializers.ModelSerializer):
    class Meta:
        model = create_MRF
        fields = "__all__"
