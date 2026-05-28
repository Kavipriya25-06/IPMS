from new_app_structure.models import VendorSubList
# from new_app_structure.Vendor_list.serializers import vendor_list_serializer

from rest_framework import serializers

class VendorSubList_serializers(serializers.ModelSerializer):
    # vendor = vendor_list_serializer()
    class Meta:
        model = VendorSubList
        fields = '__all__'
