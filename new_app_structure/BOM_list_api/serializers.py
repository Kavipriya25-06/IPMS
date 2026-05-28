from rest_framework import serializers

from new_app_structure.models import BOMList



# BOMList Serializer
class BOMlist_serializers(serializers.ModelSerializer):
    class Meta:
        model = BOMList
        fields = ['bom_name','number_of_components','created_by','created_date','last_modified_by','last_modified_date','bom_id','wbom']