from rest_framework import serializers
from new_app_structure.models import MRFList


class mrf_list_Serializer(serializers.ModelSerializer):
    class Meta:
        model = MRFList
        fields = "__all__"
