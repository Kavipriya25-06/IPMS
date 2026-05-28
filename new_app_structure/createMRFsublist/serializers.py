from rest_framework import serializers
from new_app_structure.models import MRFList, MRFsubList


class mrf_sub_list_Serializer(serializers.ModelSerializer):
    class Meta:
        model = MRFsubList
        fields = "__all__"
