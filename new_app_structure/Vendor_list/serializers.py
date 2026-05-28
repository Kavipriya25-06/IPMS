from new_app_structure.models import VendorList

from rest_framework import serializers

class vendor_list_serializer(serializers.ModelSerializer):
    class Meta:
        model = VendorList
        fields = '__all__'
